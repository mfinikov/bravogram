import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

// Titles, text and code. next/font self-hosts them at build time, so the page makes no font requests to Google.
const familjen = Familjen_Grotesk({ variable: "--font-familjen", subsets: ["latin"], weight: "500" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description =
  "Bravogram is an open source, local memory shared by all your AI agents. A CLI, an MCP server and a graph view. npm i -g bravogram";

export const metadata: Metadata = {
  title: "Bravogram: one memory for all your agents",
  description,
  openGraph: {
    title: "Bravogram: one memory for all your agents",
    description: "Open source, local memory shared by Claude, Hermes and any MCP agent. Search in milliseconds, see it as a graph.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${familjen.variable} ${inter.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
