"""
Vows & Vedas — Knowledge Base Ingester for Azure AI Search
===========================================================
Reads the 11 split knowledge-base files from knowledge-base-split/,
chunks them, embeds with Azure text-embedding-3-small, and upserts
to the Azure AI Search index with category + destination_type fields.

Prerequisites:
  pip install openai azure-search-documents python-dotenv

Azure Search index MUST have these filterable fields added before running:
  - category        (Edm.String, filterable)
  - destination_type (Edm.String, filterable)

Run:
  python ingest_to_azure.py

Env vars (from .env.local):
  AZURE_OPENAI_ENDPOINT
  AZURE_OPENAI_API_KEY
  AZURE_OPENAI_API_VERSION
  AZURE_OPENAI_EMBEDDING_DEPLOYMENT   (e.g. text-embedding-3-small)
  AZURE_SEARCH_ENDPOINT
  AZURE_SEARCH_API_KEY
  AZURE_SEARCH_INDEX_NAME             (e.g. vows-vedas-chatbot)
"""

import hashlib
import os
import re
import sys
import time
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
KB_DIR        = Path(__file__).parent / "knowledge-base-split"
CHUNK_WORDS   = 200
CHUNK_OVERLAP = 40
MIN_WORDS     = 30
BATCH_SIZE    = 20   # Azure Search upload batch size
EMBED_BATCH   = 16   # OpenAI embedding batch size

# ── Load env from .env.local ──────────────────────────────────────────────────
def load_env():
    env_path = Path(__file__).parent.parent / ".env.local"
    if not env_path.exists():
        env_path = Path(__file__).parent.parent / ".env"
    if not env_path.exists():
        print("[warn] No .env.local or .env found — using existing environment")
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    print(f"Loaded env from {env_path}")

# ── Metadata parser ───────────────────────────────────────────────────────────
def parse_file_meta(content: str) -> tuple[dict, str]:
    """Extract YAML-style frontmatter and return (meta, body)."""
    meta = {}
    body = content
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if match:
        for line in match.group(1).splitlines():
            if ":" in line:
                k, _, v = line.partition(":")
                meta[k.strip()] = v.strip()
        body = content[match.end():]
    return meta, body

# ── Chunker ───────────────────────────────────────────────────────────────────
def chunk_text(text: str) -> list[str]:
    words = text.split()
    chunks, start = [], 0
    while start < len(words):
        end = min(start + CHUNK_WORDS, len(words))
        chunk = " ".join(words[start:end])
        if len(chunk.split()) >= MIN_WORDS:
            chunks.append(chunk)
        start += CHUNK_WORDS - CHUNK_OVERLAP
    return chunks

def extract_heading(chunk: str) -> str:
    for line in chunk.splitlines():
        line = line.strip()
        if line.startswith("###"):
            return line.lstrip("#").strip()
        if line.startswith("##"):
            return line.lstrip("#").strip()
        if line.startswith("#"):
            return line.lstrip("#").strip()
    return ""

def extract_city(chunk: str, destination_type: str) -> str:
    city_patterns = {
        "beach":          ["Goa"],
        "kerala":         ["Kovalam", "Kochi", "Kerala"],
        "hills":          ["Rishikesh", "Dehradun", "Srinagar", "Corbett"],
        "royal-heritage": ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer"],
        "city":           ["Delhi", "Mumbai", "Bangalore"],
    }
    cities = city_patterns.get(destination_type, [])
    for city in cities:
        if city.lower() in chunk.lower():
            return city
    return ""

# ── Embedder ──────────────────────────────────────────────────────────────────
def get_embedder():
    from openai import AzureOpenAI
    client = AzureOpenAI(
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        api_key=os.environ["AZURE_OPENAI_API_KEY"],
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-10-21"),
    )
    def embed(texts: list[str]) -> list[list[float]]:
        resp = client.embeddings.create(
            model=os.environ.get("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small"),
            input=texts,
        )
        return [d.embedding for d in resp.data]
    return embed

# ── Azure Search uploader ─────────────────────────────────────────────────────
def get_search_client():
    from azure.search.documents import SearchClient
    from azure.core.credentials import AzureKeyCredential
    return SearchClient(
        endpoint=os.environ["AZURE_SEARCH_ENDPOINT"],
        index_name=os.environ.get("AZURE_SEARCH_INDEX_NAME", "vows-vedas-chatbot"),
        credential=AzureKeyCredential(os.environ["AZURE_SEARCH_API_KEY"]),
    )

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    load_env()

    required = ["AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_API_KEY",
                "AZURE_SEARCH_ENDPOINT", "AZURE_SEARCH_API_KEY"]
    missing = [k for k in required if not os.environ.get(k)]
    if missing:
        print(f"[error] Missing env vars: {', '.join(missing)}")
        sys.exit(1)

    embed  = get_embedder()
    client = get_search_client()

    all_docs = []
    files = sorted(KB_DIR.glob("*.md"))
    print(f"\nProcessing {len(files)} knowledge base files from {KB_DIR}\n")

    for filepath in files:
        content = filepath.read_text(encoding="utf-8")
        meta, body = parse_file_meta(content)

        category         = meta.get("CATEGORY", "all")
        destination_type = meta.get("DESTINATION-TYPE", "null")
        if destination_type == "null":
            destination_type = None

        chunks = chunk_text(body)
        for chunk in chunks:
            heading = extract_heading(chunk)
            city    = extract_city(chunk, destination_type or "")
            doc_id  = hashlib.sha256(chunk.encode("utf-8")).hexdigest()[:40]
            all_docs.append({
                "_chunk":          chunk,
                "id":              doc_id,
                "content":         chunk,
                "heading":         heading,
                "section":         category,          # use category as section value
                "category":        category,
                "destination_type": destination_type or "",
                "city":            city,
                "venue_name":      heading if "venue" in category else "",
                "source":          filepath.name,
                "url":             "",
            })

        print(f"  {filepath.name:<35} {len(chunks):>3} chunks  [{category} / {destination_type}]")

    print(f"\nTotal chunks: {len(all_docs)}")
    print("Embedding...")

    # Embed in batches
    texts = [d["_chunk"] for d in all_docs]
    embeddings = []
    for i in range(0, len(texts), EMBED_BATCH):
        batch = texts[i:i+EMBED_BATCH]
        embeddings.extend(embed(batch))
        print(f"  Embedded {min(i+EMBED_BATCH, len(texts))}/{len(texts)}")
        time.sleep(0.3)  # rate limit

    # Attach embeddings and remove temp key
    upload_docs = []
    for doc, emb in zip(all_docs, embeddings):
        doc = {k: v for k, v in doc.items() if k != "_chunk"}
        doc["embedding"] = emb
        upload_docs.append(doc)

    # Upload in batches
    print("\nUploading to Azure AI Search...")
    total = 0
    for i in range(0, len(upload_docs), BATCH_SIZE):
        batch = upload_docs[i:i+BATCH_SIZE]
        results = client.upload_documents(documents=batch)
        succeeded = sum(1 for r in results if r.succeeded)
        total += succeeded
        print(f"  Batch {i//BATCH_SIZE+1}: {succeeded}/{len(batch)} succeeded")

    print(f"\n✓ Done. {total}/{len(upload_docs)} documents uploaded.")
    print(f"  Index: {os.environ.get('AZURE_SEARCH_INDEX_NAME', 'vows-vedas-chatbot')}")


if __name__ == "__main__":
    main()
