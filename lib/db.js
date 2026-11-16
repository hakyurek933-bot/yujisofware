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
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(s, null, 2));
    return s;
  }
}

async function writeFileState(state) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(state, null, 2));
}

export async function load() {
  if (mem && Date.now() - memAt < TTL) return mem;
  let s = null;
  if (useBlob()) s = await readBlob();
  if (!s) s = await readFileState();
  if (!s || typeof s !== 'object' || !Array.isArray(s.users)) s = seedState();
  if (!s.secret) {
    s.secret = crypto.randomBytes(32).toString('hex');
    await persist(s);
  }
  mem = s;
  memAt = Date.now();
  return s;
}

async function persist(state) {
  if (useBlob()) await writeBlob(state);
  else await writeFileState(state);
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
