import { CosmosClient } from "@azure/cosmos";

let _client = null;
let _db = null;

function getDb() {
  if (!_db) {
    _client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    _db = _client.database(process.env.COSMOS_DATABASE_NAME);
  }
  return _db;
}

export function getUsersContainer() {
  return getDb().container("users");
}

export function getAuthTokensContainer() {
  return getDb().container("authTokens");
}

export function getSavedIdeasContainer() {
  return getDb().container("savedIdeas");
}

export function getEnquiriesContainer() {
  return getDb().container("enquiries");
}

// Phase 0: chatbot conversation persistence. Container "conversations", pk /sessionId
// (camelCase doc shape — MUST match the copilot's reader, DECISIONS D-003/D-030).
// Created by scripts/init-conversations.mjs; runtime never creates it.
export function getConversationsContainer() {
  return getDb().container("conversations");
}
