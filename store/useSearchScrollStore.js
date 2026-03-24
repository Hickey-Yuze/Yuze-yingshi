"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSearchScrollStore = create(
  persist(
    (set, get) => ({
      scrollY: 0,

      // 保存当前滚动位置
      saveScrollPosition: () => {
        set({ scrollY: window.scrollY });
      },

      // 获取保存的滚动位置并清除（一次性恢复）
      restoreScrollPosition: () => {
        const pos = get().scrollY;
        set({ scrollY: 0 });
        return pos;
      },

      // 清除滚动位置（新搜索时调用）
      clearScrollPosition: () => {
        set({ scrollY: 0 });
      },
    }),
    {
      name: "nexttv-search-scroll",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
