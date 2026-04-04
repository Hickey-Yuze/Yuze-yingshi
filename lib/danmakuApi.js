/**
 * 弹幕相关API函数
 */

/**
 * 位置映射：将API返回的位置转换为插件需要的模式
 * right -> 0 (滚动)
 * top -> 1 (顶部)
 * bottom -> 2 (底部)
 */

import { extractEpisodeNumberFromTitle } from "@/lib/util";

const POSITION_MAP = {
  right: 0,
  top: 1,
  bottom: 2,
};

/**
 * 转换弹幕数据格式
 * 从API格式转换为插件格式
 * @param {Array} rawDanmaku - API返回的弹幕数组 [[时间, 位置, 颜色, 文字大小, 弹幕内容], ...]
 * @returns {Array} 插件格式的弹幕数组 [{ text, time, color, mode }, ...]
 */
function convertDanmakuFormat(rawDanmaku) {
  if (!Array.isArray(rawDanmaku)) {
    return [];
  }

  return rawDanmaku
    .map((item) => {
      if (!Array.isArray(item) || item.length < 5) {
        return null;
      }

      const [time, position, color, , text] = item;

      return {
        text: String(text || ""),
        time: Number(time) || 0,
        mode: POSITION_MAP[position] || 0,
        color: color || "#ffffff",
        border: false,
        fontSize: 25,
      };
    })
    .filter(Boolean);
}

export function createDanmakuLoader(
  danmakuSources,
  doubanId,
  episodeTitle,
  episodeIndex,
  isMovie,
  currentVideoUrl
) {
  const enabledSources = danmakuSources.filter((source) => source.enabled);
  if (!doubanId || !episodeTitle || enabledSources.length === 0) {
    console.log("缺少必要的参数：豆瓣ID 或 集数 或 没有启用的弹幕源");
    return () => {
      return new Promise((resolve) => {
        resolve([]);
      });
    };
  }
  let episodeNumber = extractEpisodeNumberFromTitle(episodeTitle, isMovie);
  if (episodeNumber === null) {
    episodeNumber = episodeIndex + 1;
    console.warn(
      `无法从标题 "${episodeTitle}" 中提取集数，使用索引 ${episodeNumber}`,
    );
  }
  let finalDanmuUrl;
  const sourceUrl = enabledSources[0].url;
  
  console.log("弹幕源 URL:", sourceUrl, "当前视频 URL:", currentVideoUrl);
  
  if (sourceUrl.includes('danmu.icu') && currentVideoUrl) {
    finalDanmuUrl = `${sourceUrl}/?ac=dm&url=${encodeURIComponent(currentVideoUrl)}`;
    console.log("使用 danmu.icu API, 请求URL:", finalDanmuUrl);
  } else if (sourceUrl.includes('danmu.gengyu.qzz.io') || sourceUrl.includes('danmu_api')) {
    return createDanmakuLoaderForGengYu(sourceUrl, doubanId, episodeTitle, episodeNumber);
  } else {
    finalDanmuUrl = `${sourceUrl}/api/v2/douban?douban_id=${doubanId}&episode_number=${episodeNumber}`;
  }
  console.log("获取弹幕URL:", finalDanmuUrl);
  return () => {
    return new Promise((resolve, reject) => {
      console.log("开始获取弹幕...");
      fetch(finalDanmuUrl)
        .then((response) => {
          console.log("弹幕响应状态:", response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("弹幕原始数据:", data);
          const convertedData = convertDanmakuFormat(data.danmuku || []);
          console.log(`成功获取 ${convertedData.length} 条弹幕`);
          resolve(convertedData);
        })
        .catch((error) => {
          console.error("获取弹幕失败:", error);
          resolve([]);
        });
    });
  };
}

function createDanmakuLoaderForGengYu(sourceUrl, doubanId, episodeTitle, episodeNumber) {
  const searchKeyword = episodeTitle.replace(/\(.*?\)/g, '').trim();
  const searchUrl = `${sourceUrl}/api/v2/search/anime?keyword=${encodeURIComponent(searchKeyword)}`;
  console.log("搜索动漫关键字:", searchKeyword, "URL:", searchUrl);
  
  return () => {
    return new Promise(async (resolve) => {
      try {
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        console.log("搜索结果:", searchData);
        
        if (!searchData.animes || searchData.animes.length === 0) {
          console.log("未找到匹配的动漫，尝试用视频标题搜索");
          const fallbackUrl = `${sourceUrl}/api/v2/search/anime?keyword=${encodeURIComponent(episodeTitle)}`;
          console.log("备用搜索URL:", fallbackUrl);
          const fallbackResponse = await fetch(fallbackUrl);
          const fallbackData = await fallbackResponse.json();
          console.log("备用搜索结果:", fallbackData);
          
          if (!fallbackData.animes || fallbackData.animes.length === 0) {
            console.log("备用搜索也未找到");
            resolve([]);
            return;
          }
          
          var anime = fallbackData.animes[0];
        } else {
          var anime = searchData.animes[0];
        }
        
        const animeId = anime.animeId;
        console.log("找到动漫 ID:", animeId, "标题:", anime.animeTitle);
        
        const detailUrl = `${sourceUrl}/api/v2/bangumi/${animeId}`;
        const detailResponse = await fetch(detailUrl);
        const detailData = await detailResponse.json();
        console.log("番剧详情:", detailData);
        
        if (!detailData.bangumi || !detailData.bangumi.episodes) {
          resolve([]);
          return;
        }
        
        const episodes = detailData.bangumi.episodes;
        const targetEpisode = episodes.find(ep => ep.episodeNumber === String(episodeNumber)) || episodes[episodeNumber - 1];
        
        if (!targetEpisode) {
          console.log("未找到对应集数");
          resolve([]);
          return;
        }
        
        const episodeId = targetEpisode.episodeId;
        console.log("找到集数 ID:", episodeId);
        
        const danmakuUrl = `${sourceUrl}/api/v2/comment/${episodeId}`;
        console.log("获取弹幕URL:", danmakuUrl);
        
        const danmakuResponse = await fetch(danmakuUrl);
        const danmakuData = await danmakuResponse.json();
        console.log("弹幕数据:", danmakuData);
        
        const convertedData = convertDanmakuFormat(danmakuData.danmuku || []);
        console.log(`成功获取 ${convertedData.length} 条弹幕`);
        resolve(convertedData);
      } catch (error) {
        console.error("获取弹幕失败:", error);
        resolve([]);
      }
    });
  };
}

export async function searchAnime(baseUrl, animeName) {
  const apiUrl = `${baseUrl}/api/v2/search/anime?keyword=${encodeURIComponent(animeName)}`;
  // 添加超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 10秒超时
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      keepalive: true,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("搜索动漫失败:", error);
  }
}

export async function getEpisodes(baseUrl, animeId) {
  const apiUrl = `${baseUrl}/api/v2/bangumi/${animeId}`;
  // 添加超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 10秒超时
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      keepalive: true,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("获取动漫集数失败:", error);
  }
}


export function createDanmakuLoaderDirect(
  danmakuSources,
  episodeId
) {
  const enabledSources = danmakuSources.filter((source) => source.enabled);
  const finalDanmuUrl = `${enabledSources[0].url}/api/v2/comment/${episodeId}`;
  console.log("获取弹幕URL:", finalDanmuUrl);
  return () => {
    return new Promise((resolve, reject) => {
      fetch(finalDanmuUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          const convertedData = convertDanmakuFormat(data.danmuku || []);
          console.log(`成功获取 ${convertedData.length} 条弹幕`);
          resolve(convertedData);
        })
        .catch((error) => {
          console.error("获取弹幕失败:", error);
        });
    });
  };
}