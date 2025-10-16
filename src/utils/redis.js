// Redis 클라이언트 인스턴스 (서버 사이드에서 사용)
import Redis from "ioredis";

let redis;

const getRedisClient = () => {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });
  }
  return redis;
};

// 호텔 조회수 관련 함수들
export const redisUtils = {
  // 호텔 실시간 조회수 증가
  incrementHotelView: async (hotelId) => {
    const client = getRedisClient();
    const key = `hotel:views:${hotelId}`;
    await client.incr(key);
    await client.expire(key, 86400); // 24시간 후 만료
  },

  // 호텔 실시간 조회수 조회
  getHotelViews: async (hotelId) => {
    const client = getRedisClient();
    const key = `hotel:views:${hotelId}`;
    const views = await client.get(key);
    return parseInt(views) || 0;
  },

  // 여러 호텔의 조회수 조회
  getMultipleHotelViews: async (hotelIds) => {
    const client = getRedisClient();
    const keys = hotelIds.map((id) => `hotel:views:${id}`);
    const views = await client.mget(...keys);
    return views.map((view, index) => ({
      hotelId: hotelIds[index],
      views: parseInt(view) || 0,
    }));
  },

  // 실시간 사용자 세션 관리
  addUserSession: async (sessionId, hotelId) => {
    const client = getRedisClient();
    const key = `hotel:session:${hotelId}`;
    await client.sadd(key, sessionId);
    await client.expire(key, 1800); // 30분 후 만료
  },

  removeUserSession: async (sessionId, hotelId) => {
    const client = getRedisClient();
    const key = `hotel:session:${hotelId}`;
    await client.srem(key, sessionId);
  },

  getHotelActiveUsers: async (hotelId) => {
    const client = getRedisClient();
    const key = `hotel:session:${hotelId}`;
    const count = await client.scard(key);
    return count;
  },

  // 인기 호텔 순위 조회
  getPopularHotels: async (limit = 10) => {
    const client = getRedisClient();
    const keys = await client.keys("hotel:views:*");
    const views = [];

    for (const key of keys) {
      const hotelId = key.replace("hotel:views:", "");
      const count = await client.get(key);
      views.push({ hotelId, views: parseInt(count) || 0 });
    }

    return views.sort((a, b) => b.views - a.views).slice(0, limit);
  },
};

export default getRedisClient;
