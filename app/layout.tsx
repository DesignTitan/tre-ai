import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DeviceFrame } from "@/components/DeviceFrame";
import { TabBar } from "@/components/TabBar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "tre.ai — field rep tool",
  description: "Land in any city. See the owners worth knocking on.",
  applicationName: "tre.ai",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "tre.ai",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F4F1EC",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <DeviceFrame>
          <main className="flex-1 overflow-y-auto no-scrollbar pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-20 pt-[env(safe-area-inset-top)] sm:pt-2 screen-enter">
            {children}
          </main>
          <TabBar />
        </DeviceFrame>
      </body>
    </html>
  );
}
