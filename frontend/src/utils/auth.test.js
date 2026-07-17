import test from "node:test";
import assert from "node:assert/strict";
import { setAuthData, clearAuthData, getToken, getUser } from "./auth.js";

function makeToken(role = "patient") {
  const payload = JSON.stringify({ id: "user-1", role });
  return `header.${Buffer.from(payload).toString("base64")}.signature`;
}

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

const sessionStorageMock = new MemoryStorage();
const localStorageMock = new MemoryStorage();

globalThis.sessionStorage = sessionStorageMock;
globalThis.localStorage = localStorageMock;
globalThis.window = { location: { href: "" } };

test("setAuthData stores auth in session storage", () => {
  const token = makeToken("patient");
  setAuthData(token, { name: "Alice", role: "patient" });

  assert.equal(getToken(), token);
  assert.deepEqual(getUser(), {
    name: "Alice",
    role: "patient",
    id: "user-1",
  });
});

test("clearAuthData removes auth from session storage", () => {
  const token = makeToken("doctor");
  setAuthData(token, { name: "Bob", role: "doctor" });
  clearAuthData();

  assert.equal(getToken(), null);
  assert.equal(getUser(), null);
});
