// const redis = require("redis");
// const { promisify } = require("util");
// const client = redis.createClient({ port: 6379 });
// client.auth(process.env.REDIS_PASSWORD);

// class Cache {
//   constructor(client) {
//     this.client = client;
//     this.get = promisify(client.get).bind(client);
//     this.set = promisify(client.set).bind(client);
//     this.del = promisify(client.del).bind(client);
//   }
//   async checkCache(key) {
//     const result = await this.get(key);
//     return result;
//   }
//   async setRecord(key, value) {
//     await this.set(key, value);
//   }
//   async removeRecord(keys) {
//     await this.del(keys);
//   }
// }

// const RedisCache = new Cache(client);
// module.exports = RedisCache;
