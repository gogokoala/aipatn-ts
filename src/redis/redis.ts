import * as Redis from 'ioredis'
import { randomBytes } from 'crypto'

export class RedisStore {
    client: Redis.Redis

    constructor() {
        this.client = new Redis();
    }

    getID(length: number) {
        return randomBytes(length).toString('hex');
    }
    
    async get(sid: string) {
        let data = await this.client.get(`SESSION:${sid}`);
        return JSON.parse(data);
    }

    async set(session: any, { sid =  this.getID(24), maxAge = 3600000 } = {}) {
        try {
            // Use redis set EX to automatically drop expired sessions
            await this.client.set(`SESSION:${sid}`, JSON.stringify(session), 'EX', maxAge / 1000);
        } catch (e) {}
        return sid;
    }

    async destroy(sid: string) {
        return await this.client.del(`SESSION:${sid}`);
    }
}

