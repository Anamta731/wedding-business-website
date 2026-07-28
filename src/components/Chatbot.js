"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackClient, getSessionId } from "@/lib/clientTelemetry";

// Render inline markdown: **bold** → gold semibold span
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold text-[#e8d5a3]">{part.slice(2, -2)}</strong>
      : part
  );
}

// Lightweight markdown renderer — handles bold, bullet lists, paragraphs, and action markers
function BotMessage({ text, onCtaClick, contactHref = "/contact" }) {
  if (!text) return null;

  const blocks = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push(
        <ul key={blocks.length} className="space-y-1 my-1">
          {currentList.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[#C9A234] mt-[3px] shrink-0">–</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  for (const line of text.split("\n")) {
    if (line.trim() === "[MOODBOARDS_LINK]") {
      flushList();
      blocks.push(
        <a
          key={blocks.length}
          href="/moodboards"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-medium tracking-[0.15em] uppercase text-[#1A1408] bg-[#C9A234] px-4 py-2 rounded-full hover:bg-[#C9A234]/90 transition-colors duration-200"
        >
          Browse Moodboards →
        </a>
      );
      continue;
    }
    if (line.includes("[DISCOVERY_CALL_LINK]")) {
      flushList();
      const cls = "inline-flex items-center gap-1.5 mt-2 text-[11px] font-medium tracking-[0.15em] uppercase text-[#1A1408] bg-[#C9A234] px-4 py-2 rounded-full hover:bg-[#C9A234]/90 transition-colors duration-200 cursor-pointer";
      const parts = line.split("[DISCOVERY_CALL_LINK]");
      if (parts[0].trim()) blocks.push(<p key={blocks.length} className="leading-[1.75]">{renderInline(parts[0].trim())}</p>);
      const idx = blocks.length;
      blocks.push(
        onCtaClick
          ? <button key={idx} onClick={onCtaClick} className={cls}>Schedule a Call →</button>
          : <a key={idx} href={contactHref} className={cls}>Schedule a Call →</a>
      );
      if (parts[1]?.trim()) blocks.push(<p key={blocks.length} className="leading-[1.75]">{renderInline(parts[1].trim())}</p>);
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      currentList.push(bulletMatch[1]);
    } else {
      flushList();
      const trimmed = line.trim();
      if (trimmed) {
        blocks.push(
          <p key={blocks.length} className="leading-[1.75]">{renderInline(trimmed)}</p>
        );
      }
    }
  }
  flushList();

  return <div className="space-y-1">{blocks}</div>;
}

const GET_QUOTE_LABEL = "Start Planning";

const STARTERS = [
  GET_QUOTE_LABEL,
  "What services does Vows & Vedas provide?",
  "Show me a sample wedding itinerary",
];

const INITIAL_MESSAGE = {
  role: "bot",
  text: "Hello — I'm Mira, your wedding concierge at Vows & Vedas. I'm here to help you imagine and plan a celebration that feels entirely your own. Tell me about the wedding you're dreaming of.",
};

export default function Chatbot() {
  const pathname = usePathname();
  // On /lp landing pages, in-chat "contact" / "speak to a planner" actions stay
  // inside the campaign funnel (the landing enquiry page) instead of leaving for
  // the main-site /contact. Off /lp, behaviour is unchanged.
  const contactHref = pathname?.startsWith("/lp")
    ? `${pathname.replace(/\/+$/, "")}/enquire`
    : "/contact";
  const [open, setOpen]               = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages]       = useState([INITIAL_MESSAGE]);
  const [input, setInput]             = useState("");
  const [startersVisible, setStartersVisible] = useState(true);
  const [isStreaming, setIsStreaming]  = useState(false);
  const [accIntent, setAccIntent]     = useState({});
  const [leadCaptured]                = useState(false);
  const [usedChips, setUsedChips]     = useState([]);
  const [slowResponse, setSlowResponse]   = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [unreadCount, setUnreadCount]     = useState(1);
  const [tooltipVisible, setTooltipVisible] = useState(true);
  const [showLeadForm, setShowLeadForm]   = useState(false);
  const [leadName, setLeadName]           = useState("");
  const [leadContact, setLeadContact]     = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError]         = useState("");
  const messagesEndRef   = useRef(null);
  const inputRef         = useRef(null);
  const abortRef         = useRef(null);
  const sessionIdRef     = useRef(`sess_${Date.now().toString(36)}`);
  const leadFiredRef     = useRef(false);
  const firstMsgFiredRef = useRef(false);
  const autoLeadFiredRef = useRef(false);
  const latestMessagesRef = useRef([INITIAL_MESSAGE]);

  const resetConversation = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setStartersVisible(true);
    setAccIntent({});
    setUsedChips([]);
    setFeedbackGiven({});
    setShowLeadForm(false);
    setLeadName("");
    setLeadContact("");
    setLeadSubmitted(false);
    setLeadError("");
    leadFiredRef.current = false;
    autoLeadFiredRef.current = false;
  };

  useEffect(() => {
    if (open) {
      setSidebarOpen(false);
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
      // Pre-warm the API and Azure OpenAI so first message responds instantly
      fetch("/api/warm").catch(() => {});
      trackClient("ChatbotOpened", { sourcePagePath: window.location.pathname });
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    latestMessagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!isStreaming) { setSlowResponse(false); return; }
    const t = setTimeout(() => setSlowResponse(true), 30000);
    return () => clearTimeout(t);
  }, [isStreaming]);

  useEffect(() => {
    window.toggleChat = () => setOpen(prev => !prev);
    // Align the chatbot session id with the site-wide session so chatbot,
    // page-view and enquiry events join into one funnel in the workbook.
    const sid = getSessionId();
    if (sid) sessionIdRef.current = sid;
    return () => { delete window.toggleChat; };
  }, []);

  const historyForApi = () =>
    messages
      .filter(m => m.role !== "typing")
      .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));

  const saveChatContext = () => {
    const ctx = {
      intent_level:  accIntent.intent_level  || "low",
      cities:        accIntent.cities        || [],
      venues_viewed: accIntent.venues_viewed || [],
      stage:         accIntent.stage         || "discovery",
      wedding_date:  accIntent.wedding_date  || null,
      budget_tier:   accIntent.budget_tier   || null,
      last_turns: messages
        .filter(m => m.role !== "typing" && m.text)
        .slice(-6)
        .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
      session_id: sessionIdRef.current,
    };
    try { sessionStorage.setItem("chatbot_context", JSON.stringify(ctx)); } catch {}
  };

  const fireLeadNotify = (overrideIntent = null) => {
    const isTest = typeof window !== "undefined" && (
      window.location.hostname === "localhost" ||
      new URLSearchParams(window.location.search).get("test") === "1"
    );
    fetch("/api/lead-notify", {
      method:    "POST",
      headers:   { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        source:               "chatbot",
        accumulated_intent:   overrideIntent || accIntent,
        conversation_history: latestMessagesRef.current
          .filter(m => m.role !== "typing" && m.text)
          .slice(-12)
          .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
        session_id: sessionIdRef.current,
        is_test:    isTest,
      }),
    }).catch(() => {});
  };

  const isValidContact = (val) => {
    const v = val.trim();
    if (!v) return false;
    if (v.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    const digits = v.replace(/[\s\-\(\)\+]/g, "");
    return /^\d{7,15}$/.test(digits);
  };

  const submitLead = () => {
    if (!leadName.trim() && !leadContact.trim()) {
      setLeadError("Please share your name or contact details.");
      return;
    }
    if (leadContact.trim() && !isValidContact(leadContact)) {
      setLeadError("Please enter a valid phone number (e.g. +91 98765 43210) or email address.");
      return;
    }
    setLeadError("");
    fetch("/api/lead-notify", {
      method:    "POST",
      headers:   { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        source:               "chatbot_inline_form",
        name:                 leadName.trim(),
        contact:              leadContact.trim(),
        accumulated_intent:   accIntent,
        conversation_history: latestMessagesRef.current
          .filter(m => m.role !== "typing" && m.text)
          .slice(-12)
          .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
        session_id: sessionIdRef.current,
      }),
    }).catch(() => {});
    setLeadSubmitted(true);
    setShowLeadForm(false);
  };

  const handleCtaToContact = () => {
    saveChatContext();
    fireLeadNotify();
    window.location.href = contactHref;
  };

  const handleFeedback = (vote, msgIndex) => {
    setFeedbackGiven(prev => ({ ...prev, [msgIndex]: vote }));
    if (vote === "down") {
      const botMsg  = messages[msgIndex]?.text || "";
      const userMsg = messages[msgIndex - 1]?.role === "user" ? messages[msgIndex - 1].text : "";
      fetch("/api/feedback-alert", {
        method:    "POST",
        headers:   { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          message_text:            botMsg,
          preceding_user_message:  userMsg,
          session_id:              sessionIdRef.current,
        }),
      }).catch(() => {});
    }
  };

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isStreaming) return;

    setInput("");
    setStartersVisible(false);
    setIsStreaming(true);

    if (!firstMsgFiredRef.current) {
      firstMsgFiredRef.current = true;
      trackClient("ChatbotFirstMessage", { sourcePagePath: window.location.pathname });
    }

    // Add user message + empty bot placeholder for streaming into
    const userMsg  = { role: "user", text: trimmed };
    const botMsg   = { role: "bot",  text: "", streaming: true };
    setMessages(prev => [...prev, userMsg, botMsg]);

    abortRef.current = new AbortController();
    let latestIntent = accIntent;

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        signal:  abortRef.current.signal,
        body: JSON.stringify({
          query:                trimmed,
          conversation_history: historyForApi(),
          accumulated_intent:   accIntent,
          lead_captured:        leadCaptured,
          used_chips:           usedChips,
          session_id:           sessionIdRef.current,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "token") {
              setMessages(prev => {
                const updated = [...prev];
                const last    = updated[updated.length - 1];
                if (last?.role === "bot") updated[updated.length - 1] = { ...last, text: last.text + event.text };
                return updated;
              });
            } else if (event.type === "meta") {
              if (event.accumulated_intent) {
                latestIntent = event.accumulated_intent;
                setAccIntent(event.accumulated_intent);
                if (
                  (event.accumulated_intent.intent_level === "high" ||
                    (event.accumulated_intent.intent_level === "medium" && messages.length >= 6)) &&
                  !leadFiredRef.current
                ) {
                  leadFiredRef.current = true;
                  setShowLeadForm(true);
                }
              }
            } else if (event.type === "done") {
              const newChips = event.suggestions || [];
              setUsedChips(prev => [...new Set([...prev, ...newChips])]);
              setMessages(prev => {
                const updated = [...prev];
                const last    = updated[updated.length - 1];
                if (last?.role === "bot") updated[updated.length - 1] = {
                  ...last,
                  streaming: false,
                  suggestions: newChips,
                };
                return updated;
              });
              // Auto-fire intent email after first complete exchange, no click needed
              if (!autoLeadFiredRef.current) {
                autoLeadFiredRef.current = true;
                fireLeadNotify(latestIntent);
              }
            } else if (event.type === "error") {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "bot", text: event.message, streaming: false };
                return updated;
              });
            }
          } catch { /* malformed SSE line — skip */ }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "bot",
            text: "Something went wrong. Please try again or tap 'SPEAK TO US' below to reach us directly.",
            streaming: false,
          };
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showHandoffCta = accIntent.stage === "handoff" ||
    (accIntent.intent_level === "high" && messages.length > 6);

  // Landing pages (/lp/*): the chat concierge renders, but the quick-action
  // rail stays off (its Enquiry link would navigate visitors off the landing
  // page, and the landing bottom bar already covers call/WhatsApp). The
  // launcher lifts above the landing page's bottom action bar on phones.
  const isLp = pathname?.startsWith("/lp") ?? false;
  // The landing enquiry page (/lp/*/enquire) is a focused, single-task form —
  // the concierge is hidden entirely there so nothing competes with the form.
  const isLpEnquire = isLp && (pathname?.endsWith("/enquire") ?? false);

  return (
    <>
      {/* ── Mobile backdrop when chat is open ──────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[1999] bg-black/45 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Right sidebar: Call / Email / WhatsApp ─────────────────── */}
      <div className={`fixed right-0 top-1/2 -translate-y-1/2 z-[2001] ${isLp ? "hidden" : ""} ${open ? "hidden sm:block" : ""}`}>
        {sidebarOpen ? (
          <div className="bg-[#1A1408] border border-[#C9A234]/25 border-r-0 rounded-l-2xl flex flex-col items-center shadow-[-8px_0_40px_rgba(0,0,0,0.45)]">

            {/* Close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close contact panel"
              className="w-full flex items-center justify-center pt-3 pb-2 text-[#9A8F7E] hover:text-[#C9A234] transition-colors duration-200"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <div className="w-8 h-px bg-[#C9A234]/20" />

            {/* Call Us */}
            <a
              href="tel:+919654277656"
              aria-label="Call us"
              onClick={() => trackClient("CtaClick", { channel: "phone", location: "chatbot" })}
              className="group flex flex-col items-center gap-1.5 px-4 py-3.5 hover:bg-[#251C0D] transition-colors duration-200 w-full"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#C9A234] group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.93a16 16 0 0 0 6.29 6.29l.93-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className="text-[#C9A234] text-[8px] tracking-[0.2em] uppercase font-medium leading-none whitespace-nowrap">Call Us</span>
            </a>

            <div className="w-8 h-px bg-[#C9A234]/20" />

            {/* Email / Enquiry */}
            <a
              href="/contact"
              aria-label="Enquiry form"
              className="group flex flex-col items-center gap-1.5 px-4 py-3.5 hover:bg-[#251C0D] transition-colors duration-200 w-full"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#C9A234] group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
              <span className="text-[#C9A234] text-[8px] tracking-[0.2em] uppercase font-medium leading-none whitespace-nowrap">Enquiry</span>
            </a>

            <div className="w-8 h-px bg-[#C9A234]/20" />

            {/* WhatsApp */}
            <a
              href="https://wa.me/919654277656"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              onClick={() => trackClient("CtaClick", { channel: "whatsapp", location: "chatbot" })}
              className="group flex flex-col items-center gap-1.5 px-4 py-3.5 hover:bg-[#251C0D] transition-colors duration-200 w-full"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#C9A234] group-hover:scale-110 transition-transform duration-200" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.15 6.34 2.15 11.69c0 1.7.46 3.36 1.32 4.82L2 22l5.62-1.43a10.1 10.1 0 0 0 4.42 1.03c5.46 0 9.9-4.34 9.9-9.69S17.5 2 12.04 2Zm0 17.93a8.36 8.36 0 0 1-4.05-1.05l-.29-.16-3.33.85.89-3.17-.18-.31a7.97 7.97 0 0 1-1.25-4.4c0-4.43 3.68-8.03 8.21-8.03 4.54 0 8.22 3.6 8.22 8.03 0 4.44-3.68 8.24-8.22 8.24Zm4.51-6.02c-.25-.12-1.47-.71-1.7-.79-.23-.09-.4-.12-.56.12-.17.24-.64.79-.78.95-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.2-.73-.64-1.23-1.44-1.37-1.68-.14-.24-.01-.37.11-.49.11-.11.25-.29.37-.43.12-.14.17-.24.25-.4.08-.16.04-.3-.02-.43-.06-.12-.56-1.32-.77-1.81-.2-.47-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.3-.23.24-.87.83-.87 2.03 0 1.19.89 2.35 1.01 2.51.12.16 1.75 2.62 4.24 3.67.59.25 1.05.4 1.41.51.59.18 1.13.16 1.56.1.47-.07 1.47-.59 1.68-1.15.21-.57.21-1.05.14-1.15-.06-.11-.22-.17-.46-.29Z" />
              </svg>
              <span className="text-[#C9A234] text-[8px] tracking-[0.2em] uppercase font-medium leading-none whitespace-nowrap">WhatsApp</span>
            </a>

            <div className="pb-2" />
          </div>
        ) : (
          /* Re-open tab */
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open contact options"
            className="w-6 h-16 bg-[#1A1408] border border-[#C9A234]/30 border-r-0 rounded-l-lg flex items-center justify-center text-[#C9A234] hover:bg-[#251C0D] transition-colors duration-200 shadow-[-4px_0_20px_rgba(0,0,0,0.4)]"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Bottom-right: Chat panel + toggle ──────────────────────── */}
      <div className={`fixed ${isLpEnquire ? "hidden" : ""} ${isLp ? "bottom-[104px] md:bottom-8" : "bottom-6 sm:bottom-8"} right-4 sm:right-8 z-[2000] flex flex-col gap-3 items-end pointer-events-none`}>

        {/* Chat panel */}
        <div
          className={`
            flex flex-col
            w-[calc(100vw-32px)] sm:w-[390px]
            h-[70vh] sm:h-[560px]
            bg-[#1A1408] border border-[#C9A234]/25
            shadow-[0_24px_80px_rgba(0,0,0,0.55)]
            rounded-2xl overflow-hidden
            origin-bottom-right
            transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${open
              ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
              : "opacity-0 scale-95 pointer-events-none translate-y-3"}
          `}
          aria-hidden={!open}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#C9A234]/15 shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 shrink-0 rounded-full bg-[#1A1408] border border-[#C9A234]/50 overflow-hidden flex items-center justify-center shadow-[0_0_10px_3px_rgba(201,162,52,0.3)]">
                <img
                  src="/assets/photos/mira-avatar.png"
                  alt="MIRA"
                  className="w-full h-full object-cover"
                  style={{ transform: "scale(1.3)", transformOrigin: "center top" }}
                />
              </span>
              <div>
                <p className="font-heading text-[#FDFAF5] text-[17px] leading-tight">MIRA</p>
                <p className="text-[#9A8F7E] text-[10px] tracking-[0.18em] uppercase font-medium mt-0.5">Wedding Concierge</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetConversation}
                aria-label="New conversation"
                title="Start new conversation"
                className="w-8 h-8 flex items-center justify-center text-[#9A8F7E] hover:text-[#C9A234] transition-colors duration-200 cursor-none"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="w-8 h-8 flex items-center justify-center text-[#9A8F7E] hover:text-[#C9A234] transition-colors duration-200 cursor-none"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* AI / data disclosure — persistent, visible before first message */}
          <div className="px-5 py-2 border-b border-[#C9A234]/10 shrink-0 bg-[#1A1408]/40">
            <p className="text-[9px] leading-[1.5] text-[#9A8F7E]">
              This assistant uses AI. Conversations may be saved to help us plan your wedding{" "}
              <span className="text-[#9A8F7E]/60">·</span>{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C9A234] hover:opacity-70 transition-opacity underline underline-offset-2"
              >
                Privacy
              </a>
            </p>
          </div>

          {/* Messages */}
          <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#C9A234]/20">
            {messages.map((msg, i) => {
              const isLastBotMsg = msg.role === "bot" &&
                messages.slice(i + 1).every(m => m.role !== "bot");
              const prevMsg = i > 0 ? messages[i - 1] : null;
              const showAvatar = msg.role === "bot" && prevMsg?.role !== "bot";
              return (
                <div key={i} className="flex flex-col gap-2 group">
                  {/* Message bubble row */}
                  <div className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.role === "bot" && (
                      showAvatar ? (
                        <span className="w-7 h-7 shrink-0 rounded-full bg-[#1A1408] border border-[#C9A234]/50 overflow-hidden flex items-center justify-center mb-0.5 shadow-[0_0_8px_2px_rgba(201,162,52,0.25)]">
                          <img
                            src="/assets/photos/mira-avatar.png"
                            alt="MIRA"
                            className="w-full h-full object-cover"
                            style={{ transform: "scale(1.3)", transformOrigin: "center top" }}
                          />
                        </span>
                      ) : (
                        <span className="w-7 h-7 shrink-0 mb-0.5" />
                      )
                    )}
                    <div
                      className={`
                        max-w-[78%] px-4 py-3 text-[13px] leading-[1.75] font-light
                        ${msg.role === "bot"
                          ? "bg-[#251C0D] text-[#FDFAF5]/90 rounded-2xl rounded-bl-sm border border-[#C9A234]/10"
                          : "bg-[#C9A234] text-[#1A1408] rounded-2xl rounded-br-sm font-medium"}
                      `}
                    >
                      {msg.streaming && !msg.text ? (
                        <span className="flex flex-col gap-1.5 py-0.5">
                          <span className="flex items-center gap-2">
                            <span className="flex gap-1 items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A234] animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A234] animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A234] animate-bounce" style={{ animationDelay: "300ms" }} />
                            </span>
                            <span className="text-[11px] text-[#9A8F7E] italic">Mira is thinking…</span>
                          </span>
                          {slowResponse && (
                            <span className="text-[10px] text-[#9A8F7E]/70 leading-snug">
                              Taking longer than usual —{" "}
                              <button onClick={handleCtaToContact} className="text-[#C9A234] underline underline-offset-2 cursor-pointer">
                                speak to us now
                              </button>
                            </span>
                          )}
                        </span>
                      ) : msg.role === "bot" ? <BotMessage text={msg.text} onCtaClick={isLastBotMsg ? handleCtaToContact : undefined} contactHref={contactHref} /> : msg.text}
                    </div>
                  </div>

                  {/* Feedback thumbs — hover-only on desktop, always visible on mobile */}
                  {msg.role === "bot" && !msg.streaming && i > 0 && (
                    <div className="flex items-center gap-2 ml-9 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      {feedbackGiven[i] ? (
                        <span className="text-[10px] text-[#9A8F7E]/60 tracking-[0.1em]">
                          {feedbackGiven[i] === "up" ? "Glad that helped" : "Thanks for letting us know"}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleFeedback("up", i)}
                            aria-label="Helpful"
                            className="text-[#9A8F7E]/40 hover:text-[#C9A234] transition-colors duration-200"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleFeedback("down", i)}
                            aria-label="Not helpful"
                            className="text-[#9A8F7E]/40 hover:text-red-400 transition-colors duration-200"
                          >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                              <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Suggestions — only on the latest bot message */}
                  {isLastBotMsg && !msg.streaming && msg.suggestions?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1 ml-9">
                      {msg.suggestions.map((s, si) => {
                        // CTA chips — open /contact directly
                        const isCtaChip = /book.*call|discovery call|start planning|speak to.*team|connect.*team|schedule.*call|planning team|get in touch/i.test(s);
                        if (isCtaChip) {
                          return (
                            <button
                              key={si}
                              onClick={handleCtaToContact}
                              className="text-[11px] text-[#1A1408] bg-[#C9A234] border border-[#C9A234] px-3 py-1.5 rounded-md hover:bg-[#C9A234]/90 transition-all duration-200 whitespace-nowrap leading-none font-medium"
                            >
                              {s} →
                            </button>
                          );
                        }
                        return (
                          <button
                            key={si}
                            onClick={() => sendMessage(s)}
                            disabled={isStreaming}
                            className="text-[11px] text-[#C9A234] border border-[#C9A234]/50 px-3.5 py-1.5 rounded-full bg-[#C9A234]/10 hover:bg-[#C9A234]/20 hover:border-[#C9A234] hover:shadow-[0_0_8px_rgba(201,162,52,0.3)] transition-all duration-200 cursor-none disabled:opacity-30 whitespace-nowrap leading-none"
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Handoff CTA — shown when user is ready to enquire */}
            {showHandoffCta && (
              <div className="flex flex-col items-start gap-2 pl-9">
                <p className="text-[10px] text-[#9A8F7E] tracking-[0.15em] uppercase">Ready to begin?</p>
                <button
                  onClick={() => { saveChatContext(); fireLeadNotify(); setOpen(false); window.location.href = contactHref; }}
                  className="text-[11px] font-medium tracking-[0.2em] uppercase bg-[#C9A234] text-[#1A1408] px-4 py-2.5 rounded-full hover:bg-[#C9A234]/90 transition-colors duration-200"
                >
                  Begin Your Journey →
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Starter prompts */}
          {startersVisible && messages.length === 1 && (
            <div className="px-4 pb-3 shrink-0">
              <p className="text-[#9A8F7E] text-[9px] tracking-[0.22em] uppercase mb-2 font-medium">Suggested</p>
              {/* Mobile: horizontal scroll chips */}
              <div className="flex sm:hidden gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
                {STARTERS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => s === GET_QUOTE_LABEL ? setShowLeadForm(true) : sendMessage(s)}
                    className={`shrink-0 text-left text-[11px] px-3 py-2 rounded-full transition-all duration-200 leading-snug whitespace-nowrap ${
                      s === GET_QUOTE_LABEL
                        ? "bg-[#C9A234] text-[#1A1408] font-medium"
                        : "text-[#FDFAF5]/70 border border-[#C9A234]/20 hover:border-[#C9A234]/60 hover:text-[#FDFAF5] hover:bg-[#C9A234]/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {/* Desktop: Start Planning full-width, then 2-col grid for the rest */}
              <div className="hidden sm:flex flex-col gap-1.5">
                {STARTERS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => s === GET_QUOTE_LABEL ? setShowLeadForm(true) : sendMessage(s)}
                    className={`text-left text-[11px] px-3 py-2 rounded-lg transition-all duration-200 cursor-none leading-snug ${
                      s === GET_QUOTE_LABEL
                        ? "bg-[#C9A234] text-[#1A1408] font-medium"
                        : "text-[#FDFAF5]/70 border border-[#C9A234]/20 hover:border-[#C9A234]/60 hover:text-[#FDFAF5] hover:bg-[#C9A234]/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Inline lead capture form — appears on high-intent, stays in chat */}
          {showLeadForm && !leadSubmitted && (
            <div className="px-4 py-3 border-t border-[#C9A234]/20 bg-[#1A1408] shrink-0">
              {/* Header row */}
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[9px] text-[#9A8F7E] uppercase tracking-[0.18em]">
                  Want our team to reach out?
                </p>
                <button
                  onClick={() => setShowLeadForm(false)}
                  aria-label="Dismiss"
                  className="text-[#9A8F7E]/50 hover:text-[#9A8F7E] transition-colors duration-200 leading-none"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              {/* Inputs row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={leadName}
                  onChange={e => { setLeadName(e.target.value); setLeadError(""); }}
                  placeholder="Your name"
                  className="flex-1 min-w-0 bg-[#251C0D] border border-[#C9A234]/20 text-[#FDFAF5] text-[12px] placeholder:text-[#9A8F7E]/50 rounded-lg px-3 py-2 outline-none focus:border-[#C9A234]/50 transition-colors duration-200"
                />
                <input
                  type="text"
                  value={leadContact}
                  onChange={e => { setLeadContact(e.target.value); setLeadError(""); }}
                  onKeyDown={e => e.key === "Enter" && submitLead()}
                  placeholder="WhatsApp / email"
                  className="flex-1 min-w-0 bg-[#251C0D] border border-[#C9A234]/20 text-[#FDFAF5] text-[12px] placeholder:text-[#9A8F7E]/50 rounded-lg px-3 py-2 outline-none focus:border-[#C9A234]/50 transition-colors duration-200"
                />
                <button
                  onClick={submitLead}
                  disabled={!leadName.trim() && !leadContact.trim()}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-[#C9A234] text-[#1A1408] hover:bg-[#C9A234]/90 transition-colors duration-200 disabled:opacity-30"
                  aria-label="Submit"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              {leadError && (
                <p className="text-[10px] text-red-400/80 mt-1.5 leading-snug">{leadError}</p>
              )}
            </div>
          )}
          {leadSubmitted && (
            <div className="px-4 py-2.5 border-t border-[#C9A234]/20 bg-[#1A1408] shrink-0">
              <p className="text-[10px] text-[#C9A234]/80 tracking-[0.12em]">
                Thank you — our team will be in touch within 24 hours.
              </p>
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-[#C9A234]/15 shrink-0">
            <div className="flex items-center gap-2 bg-[#251C0D] border border-[#C9A234]/20 rounded-xl px-4 py-2.5 focus-within:border-[#C9A234]/50 transition-colors duration-200">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about venues, services…"
                className="flex-1 bg-transparent text-[#FDFAF5] text-[13px] font-light placeholder:text-[#9A8F7E]/60 outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                aria-label="Send message"
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 cursor-none shrink-0 ${input.trim() ? "bg-[#C9A234] text-[#1A1408] shadow-[0_0_10px_rgba(201,162,52,0.4)] hover:bg-[#C9A234]/90" : "text-[#C9A234]/30"}`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </div>
            <a
              href={contactHref}
              className="mt-2.5 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-[#C9A234]/60 bg-[#C9A234]/10 text-[#C9A234] text-[10px] font-medium tracking-[0.18em] uppercase hover:bg-[#C9A234]/20 hover:border-[#C9A234] transition-all duration-200 shadow-[0_0_10px_rgba(201,162,52,0.15)]"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.93a16 16 0 0 0 6.29 6.29l.93-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Speak to us
            </a>
          </div>
        </div>

        {/* Chat toggle — tooltip left, button right */}
        <div className="flex items-center gap-3 pointer-events-auto">

          {/* Permanent tooltip to the left */}
          {tooltipVisible && !open && (
            <div className="relative bg-[#1A1408] border border-[rgba(201,162,52,0.5)] rounded-lg px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_12px_rgba(201,162,52,0.2)] whitespace-nowrap">
              {/* Close X */}
              <button
                onClick={() => setTooltipVisible(false)}
                className="absolute top-1 right-1.5 text-[#9A8F7E] hover:text-[#C9A234] text-[11px] leading-none cursor-none transition-colors"
                aria-label="Dismiss"
              >
                ✕
              </button>
              <p className="font-heading text-[11px] text-[#C9A234] tracking-[0.15em] uppercase font-semibold pr-3">Chat with Mira</p>
              <p className="text-[9px] text-[#e8d5a3] tracking-[0.08em] opacity-80 mt-0.5">Your Wedding Concierge</p>
              {/* Arrow pointing right toward the button */}
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1A1408] border-r border-t border-[rgba(201,162,52,0.5)] rotate-45" />
            </div>
          )}

          {/* Circle button */}
          <button
            onClick={() => setOpen(prev => !prev)}
            aria-label={open ? "Close chat" : "Open chat"}
            className="relative cursor-none active:scale-95 transition-transform duration-200"
          >
            <span className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${open ? "bg-[#C9A234] border border-[#C9A234] shadow-[0_0_20px_6px_rgba(201,162,52,0.5)]" : "shadow-[0_0_18px_5px_rgba(201,162,52,0.5)]"}`}>
              {open ? (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#1A1408" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              ) : (
                <span className="w-full h-full rounded-full overflow-hidden">
                  <img
                    src="/assets/photos/mira-avatar.png"
                    alt="MIRA"
                    className="w-full h-full object-cover"
                    style={{ transform: "scale(1.3)", transformOrigin: "center top" }}
                  />
                </span>
              )}
            </span>
            {!open && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[#C9A234] text-[#1A1408] text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1A1408] shadow-md z-10 pointer-events-none">
                {unreadCount}
              </span>
            )}
          </button>

        </div>

      </div>
    </>
  );
}
