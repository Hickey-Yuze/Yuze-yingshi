import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { videoSources, danmakuSources, settingsPassword } = body;
    
    console.log("收到保存请求:", { 
      videoSourcesCount: videoSources?.length, 
      danmakuSourcesCount: danmakuSources?.length,
      settingsPassword 
    });
    console.log("KV URL:", process.env.KV_REST_API_URL ? "已设置" : "未设置");
    
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
    console.error("保存失败:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("开始读取 KV 数据...");
    const data = await redis.hgetall("sources");
    console.log("读取到的数据:", data);
    
    if (!data) {
      return Response.json({ videoSources: [], danmakuSources: [], settingsPassword: "" });
    }
    
    return Response.json({
      videoSources: data.videoSources ? JSON.parse(data.videoSources) : [],
      danmakuSources: data.danmakuSources ? JSON.parse(data.danmakuSources) : [],
      settingsPassword: data.settingsPassword || ""
    });
  } catch (error) {
    console.error("读取失败:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}