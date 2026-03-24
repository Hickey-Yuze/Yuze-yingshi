"use client";

import { useRouter } from "next/navigation";
import { SpeedTestBadge } from "@/components/SpeedTestBadge";
import { MaterialSymbolsStarRounded } from "@/components/icons";

import { useSettingsStore } from "@/store/useSettingsStore";
import { useSearchScrollStore } from "@/store/useSearchScrollStore";

export function MovieCard({ movie }) {
  const router = useRouter();
  const doubanImageProxy = useSettingsStore((state) => state.doubanImageProxy);
  const clearScrollPosition = useSearchScrollStore((state) => state.clearScrollPosition);

  let douban_image_url = movie.poster;

  // 只代理豆瓣的图片
  if (douban_image_url.includes("doubanio")) {
    if (doubanImageProxy === 'server') {
      // 使用本地 API 代理
      douban_image_url = `/api/douban/image?url=${encodeURIComponent(movie.poster)}`;
    } else {
      // 使用 CDN 替换
      douban_image_url = movie.poster.replace(
        /img\d+\.doubanio\.com/g,
        doubanImageProxy
      );
    }
  }

  const handleClick = () => {
    // 如果有 source 信息（从 API 搜索来的），则传递 source 参数到播放页面
    if (movie.source) {
      router.push(`/play/${movie.id}?source=${movie.source}`);
    } else {
      // 豆瓣卡片或红果卡片，跳转到搜索页面，使用 title 搜索
      clearScrollPosition();
      router.push(`/search?q=${encodeURIComponent(movie.title)}`);
    }
  };

  return (
    <div
      className="group relative flex flex-col gap-3 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative w-full aspect-2/3 overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-gray-200 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:ring-primary/50">
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 z-10">
          <MaterialSymbolsStarRounded className="text-primary text-[14px]" />
          {movie.rating}
        </div>
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${douban_image_url}')` }}
          aria-label={`Poster for ${movie.title}`}
        ></div>
        {movie.source_name && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="bg-primary/90 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
              {movie.source_name}
            </span>
          </div>
        )}
        {movie.doubanUrl && (
          <div className="absolute bottom-2 right-2 z-10">
            <a
              href={movie.doubanUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-black/70 hover:bg-black/90 text-white text-xs px-2 py-1 rounded-md transition-colors"
              title="在豆瓣查看"
            >
              🔗 豆瓣
            </a>
          </div>
        )}
        {movie.hongguoUrl && (
          <div className="absolute bottom-2 right-2 z-10">
            <a
              href={movie.hongguoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="bg-black/70 hover:bg-black/90 text-white text-xs px-2 py-1 rounded-md transition-colors"
              title="在红果查看"
            >
              🔗 红果
            </a>
          </div>
        )}
        {movie.source && movie.source_url && (
          <SpeedTestBadge
            videoId={movie.id}
            sourceKey={movie.source}
            sourceName={movie.source_name}
            sourceUrl={movie.source_url}
          />
        )}
      </div>
      <div>
        <h3 className="text-gray-900 text-base font-semibold leading-tight truncate group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
      </div>
    </div>
  );
};
