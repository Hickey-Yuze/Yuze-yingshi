import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { videoSources, danmakuSources, settingsPassword } = body;
    
    const data = {};
    if (videoSources !== undefined) {
      data.videoSources = JSON.stringify(videoSources);
    }
    if (danmakuSources !== undefined) {
      data.danmakuSources = JSON.stringify(danmakuSources);
    }
    if (settingsPassword !== undefined) {
      data.settingsPassword = settingsPassword;
    }
    data.updatedAt = new Date().toISOString();
    
    await redis.hset("sources", data);
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await redis.hgetall("sources");
    
    if (!data) {
      return Response.json({ videoSources: [], danmakuSources: [], settingsPassword: "" });
    }
    
    return Response.json({
      videoSources: data.videoSources ? JSON.parse(data.videoSources) : [],
      danmakuSources: data.danmakuSources ? JSON.parse(data.danmakuSources) : [],
      settingsPassword: data.settingsPassword || ""
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}