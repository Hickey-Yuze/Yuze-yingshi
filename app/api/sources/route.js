import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export async function POST(request) {
  try {
    const { videoSources, danmakuSources } = await request.json();
    
    await redis.hset("sources", {
      videoSources: JSON.stringify(videoSources),
      danmakuSources: JSON.stringify(danmakuSources),
      updatedAt: new Date().toISOString()
    });
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await redis.hgetall("sources");
    
    if (!data) {
      return Response.json({ videoSources: [], danmakuSources: [] });
    }
    
    return Response.json({
      videoSources: data.videoSources ? JSON.parse(data.videoSources) : [],
      danmakuSources: data.danmakuSources ? JSON.parse(data.danmakuSources) : []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}