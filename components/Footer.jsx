import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-green-200 py-8 mt-auto bg-green-50">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Image src="https://imgbed.gengyu.de5.net/file/1772363076545_logo.jpg" alt="Yuze-影视" width={32} height={32} className="w-8 h-8 object-contain rounded-full" />
          <div className="flex-col">
            <p className="text-gray-900 text-sm font-medium ">
              © 2026 Yuze-影视
            </p>
            <p className="text-gray-500 text-sm font-medium text-center">
              开源项目
            </p>
          </div>
        </div>
        <div className="flex gap-6">
          <Link
            className="text-gray-500 hover:text-primary text-sm transition-colors"
            href="/source-browse"
            suppressHydrationWarning
          >
            视频源浏览
          </Link>
          <Link
            className="text-gray-500 hover:text-primary text-sm transition-colors"
            href="/help"
            suppressHydrationWarning
          >
            帮助中心
          </Link>
        </div>
      </div>
    </footer>
  );
};
