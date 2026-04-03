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
    console.log("读取到的原始数据:", data);
    
    if (!data) {
      return Response.json({ videoSources: [], danmakuSources: [], settingsPassword: "" });
    }
    
    let videoSources = [];
    let danmakuSources = [];
    let settingsPassword = "";
    
    try {
      console.log("data.videoSources 原始值:", data.videoSources, "类型:", typeof data.videoSources);
      if (data.videoSources) {
        if (typeof data.videoSources === 'string') {
          videoSources = JSON.parse(data.videoSources);
        } else {
          videoSources = data.videoSources;
        }
      }
    } catch (e) {
      console.error("解析 videoSources 失败:", e, "原始值:", data.videoSources);
    }
    
    try {
      console.log("data.danmakuSources 原始值:", data.danmakuSources, "类型:", typeof data.danmakuSources);
      if (data.danmakuSources) {
        if (typeof data.danmakuSources === 'string') {
          danmakuSources = JSON.parse(data.danmakuSources);
        } else {
          danmakuSources = data.danmakuSources;
        }
      }
    } catch (e) {
      console.error("解析 danmakuSources 失败:", e, "原始值:", data.danmakuSources);
    }
    
    try {
      settingsPassword = data.settingsPassword || "";
    } catch (e) {
      console.error("解析 settingsPassword 失败:", e);
    }
    
    return Response.json({
      videoSources,
      danmakuSources,
      settingsPassword
    });
  } catch (error) {
    console.error("读取失败:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}