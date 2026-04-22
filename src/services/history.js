import { Redis } from '@upstash/redis';

const ENTRY_TTL_SECONDS = 7 * 24 * 60 * 60;
const DAILY_LIMIT = 50;
const DAILY_COUNTER_TTL = 48 * 60 * 60;

const INDEX_KEY = 'history:index';
const entryKey = (id) => `history:entry:${id}`;
const dailyKey = (dateStr) => `history:count:${dateStr}`;

let redisClient = null;

function getRedis() {
    if (redisClient) return redisClient;
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
        throw new Error("Upstash Redis non configuré (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN manquants).");
    }
    redisClient = new Redis({ url, token });
    return redisClient;
}

export function isHistoryEnabled() {
    return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function todayKey() {
    return dailyKey(new Date().toISOString().slice(0, 10));
}

function newId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function checkAndIncrementDailyLimit() {
    const redis = getRedis();
    const key = todayKey();
    const count = await redis.incr(key);
    if (count === 1) {
        await redis.expire(key, DAILY_COUNTER_TTL);
    }
    if (count > DAILY_LIMIT) {
        await redis.decr(key);
        return { allowed: false, count: count - 1, limit: DAILY_LIMIT };
    }
    return { allowed: true, count, limit: DAILY_LIMIT };
}

export async function getDailyUsage() {
    const redis = getRedis();
    const count = (await redis.get(todayKey())) || 0;
    return { count: Number(count), limit: DAILY_LIMIT };
}

export async function saveEntry(entry) {
    const redis = getRedis();
    const id = newId();
    const createdAt = Date.now();
    const record = { id, createdAt, ...entry };
    await redis.set(entryKey(id), JSON.stringify(record), { ex: ENTRY_TTL_SECONDS });
    await redis.zadd(INDEX_KEY, { score: createdAt, member: id });
    return record;
}

export async function listEntries() {
    const redis = getRedis();
    const cutoff = Date.now() - ENTRY_TTL_SECONDS * 1000;
    await redis.zremrangebyscore(INDEX_KEY, 0, cutoff);
    const ids = await redis.zrange(INDEX_KEY, 0, -1, { rev: true });
    if (!ids || ids.length === 0) return [];
    const keys = ids.map(entryKey);
    const rows = await redis.mget(...keys);
    const result = [];
    const staleIds = [];
    rows.forEach((row, idx) => {
        if (!row) {
            staleIds.push(ids[idx]);
            return;
        }
        const parsed = typeof row === 'string' ? JSON.parse(row) : row;
        result.push({
            id: parsed.id,
            createdAt: parsed.createdAt,
            type: parsed.type,
            keyword: parsed.keyword,
            hasImage: Boolean(parsed.imageUrl),
        });
    });
    if (staleIds.length > 0) {
        await redis.zrem(INDEX_KEY, ...staleIds);
    }
    return result;
}

export async function getEntry(id) {
    const redis = getRedis();
    const row = await redis.get(entryKey(id));
    if (!row) return null;
    return typeof row === 'string' ? JSON.parse(row) : row;
}

export async function deleteEntry(id) {
    const redis = getRedis();
    await redis.del(entryKey(id));
    await redis.zrem(INDEX_KEY, id);
}
