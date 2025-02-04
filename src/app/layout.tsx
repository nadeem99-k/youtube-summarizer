import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1a1a1a"
};

export const metadata: Metadata = {
  title: "YouTube Video Summarizer - Get Quick Video Summaries",
  description: "Get AI-powered summaries of YouTube videos instantly. Save time and extract key points from any video content.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/og-image.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/og-image.png" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YT Summary",
    startupImage: [
      "/og-image.png"
    ]
  },
  formatDetection: {
    telephone: false
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${geist.className} min-h-screen bg-gradient-to-b from-gray-900 to-gray-800`}>
        <Navbar />
        <div className="pt-16 safe-top safe-bottom">
          {children}
        </div>
      </body>
    </html>
  );
}
