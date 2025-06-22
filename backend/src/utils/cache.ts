import { createClient, RedisClientType } from 'redis';

class CacheService {
  private client: RedisClientType | null = null;

  private async connect(): Promise<RedisClientType> {
    if (this.client) return this.client;

    const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_ENDPOINT}:6379`;

    this.client = createClient({ url: redisUrl });
    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });
    await this.client.connect();
    console.log('✅ Connected to Redis at', redisUrl);
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      const client = await this.connect();
      return await client.get(key);
    } catch (err) {
      console.error('Cache GET error:', err);
      return null;
    }
  }

  async set(key: string, value: string, ttl = 3600): Promise<boolean> {
    try {
      const client = await this.connect();
      await client.setEx(key, ttl, value);
      return true;
    } catch (err) {
      console.error('Cache SET error:', err);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const client = await this.connect();
      await client.del(key);
      return true;
    } catch (err) {
      console.error('Cache DEL error:', err);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const client = await this.connect();
      return (await client.exists(key)) === 1;
    } catch (err) {
      console.error('Cache EXISTS error:', err);
      return false;
    }
  }

  async cacheRiskScore(txId: string, score: number, ttl = 1800) {
    return this.set(`risk:${txId}`, score.toString(), ttl);
  }
  async getCachedRiskScore(txId: string): Promise<number | null> {
    const v = await this.get(`risk:${txId}`);
    return v ? parseFloat(v) : null;
  }

  async cacheRoutingDecision(contextHash: string, gateway: string, ttl: number = 900) {
    return await this.set(`route:${contextHash}`, gateway, ttl);
  }

  async getCachedRoutingDecision(contextHash: string): Promise<string | null> {
    return await this.get(`route:${contextHash}`);
  }

  async cacheUserTokenBalance(userId: string, balance: number, ttl: number = 300) {
    return await this.set(`tokens:${userId}`, balance.toString(), ttl);
  }

  async getCachedUserTokenBalance(userId: string): Promise<number | null> {
    const cached = await this.get(`tokens:${userId}`);
    return cached ? parseFloat(cached) : null;
  }
}

export const cacheService = new CacheService();
