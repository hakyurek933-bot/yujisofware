import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { seedState } from './seed.js';

const FILE = path.join(process.cwd(), 'data', 'db.json');
const BLOB_KEY = 'yujisofware/db.json';
const TTL = 4000;

let mem = null;
let memAt = 0;
let chain = Promise.resolve();

const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// keeps stored state compatible when new collections are added to the schema
function ensureShape(s) {
  if (!Array.isArray(s.users)) s.users = [];
  if (!Array.isArray(s.products)) s.products = [];
  if (!Array.isArray(s.orders)) s.orders = [];
  if (!Array.isArray(s.tickets)) s.tickets = [];
  if (!Array.isArray(s.reviews)) s.reviews = [];
  if (!Array.isArray(s.announcements)) s.announcements = [];
  if (!Array.isArray(s.giveaways)) s.giveaways = [];
  if (!Array.isArray(s.categories)) s.categories = [];
  if (!s.settings) s.settings = {};
  if (!s.secret) s.secret = '';
  return s;
}

async function readBlob() {
  try {
    const { get } = await import('@vercel/blob');
    const res = await get(BLOB_KEY, { type: 'text' });
    const body = typeof res?.text === 'function' ? await res.text() : res?.body;
    if (!body) return null;
    return JSON.parse(body);
  } catch (e) {
    console.error('[db] blob read failed:', e.message);
    return null;
  }
}

async function writeBlob(state) {
  const { put } = await import('@vercel/blob');
  await put(BLOB_KEY, JSON.stringify(state), {
    access: 'public',
    allowOverwrite: true,
    contentType: 'application/json'
  });
}

async function readFileState() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    const s = seedState();
    try {
      await fs.mkdir(path.dirname(FILE), { recursive: true });
      await fs.writeFile(FILE, JSON.stringify(s, null, 2));
    } catch (e) {
      // serverless fs is read-only: seed lives in memory until blob store takes over
      console.error('[db] local seed write skipped:', e.code || e.message);
    }
    return s;
  }
}

async function writeFileState(state) {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('[db] local write skipped:', e.code || e.message);
  }
}

export async function load() {
  if (mem && Date.now() - memAt < TTL) return mem;
  let s = null;
  if (useBlob()) s = await readBlob();
  if (!s) s = await readFileState();
  if (!s || typeof s !== 'object' || !Array.isArray(s.users)) s = seedState();
  s = ensureShape(s);
  if (!s.secret) {
    s.secret = crypto.randomBytes(32).toString('hex');
    await persist(s);
  }
  mem = s;
  memAt = Date.now();
  return s;
}

async function persist(state) {
  if (useBlob()) {
    try {
      await writeBlob(state);
    } catch (e) {
      // never take the request down over a write: logged loudly for diagnosis
      console.error('[db] BLOB WRITE FAILED:', e.message);
    }
  } else {
    await writeFileState(state);
  }
}

export async function save(state) {
  mem = state;
  memAt = Date.now();
  await persist(state);
}

// read-modify-write serialized per instance; blob writes are last-write-wins across instances
export function mutate(fn) {
  const run = async () => {
    const s = await load();
    const out = await fn(s);
    await save(s);
    return out;
  };
  const p = chain.then(run, run);
  chain = p.catch(() => {});
  return p;
}
