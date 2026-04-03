import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Segoe UI Midlevel",
    "Noto Sans",
    "Helvetica",
    "Arial",
    "sans-serif",
    "Apple Color Emoji",
    "Segoe UI Emoji"
  ],
});

export const metadata = {
  title: "Yuze-影视 - 影视无限",
  description: "Yuze-影视 播放平台",
  icons: {
    icon: [
      { url: "https://imgbed.gengyu.de5.net/file/1772363076545_logo.jpg" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.className} antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-background-light text-gray-900 min-h-screen flex flex-col selection:bg-primary selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center w-full px-4 md:px-8 pb-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
