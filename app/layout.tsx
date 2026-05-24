import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://doc2mcp.site"
  ),
  title: "doc2mcp — Paste Docs URL, Get MCP Server",
  description:
    "Turn any documentation URL into a Cursor-ready MCP server in seconds. No install, no API keys — powered by ASI1.",
  icons: {
    icon: "/doc2mcp-logo.png",
    apple: "/doc2mcp-logo.png",
  },
  openGraph: {
    title: "doc2mcp — Any docs URL → Cursor-ready MCP",
    description:
      "Paste a documentation URL. Get a hosted MCP server Cursor can read in seconds. No install, no API keys.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://doc2mcp.site",
    siteName: "doc2mcp",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "doc2mcp — paste docs URL, get MCP server",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "doc2mcp — Any docs URL → Cursor-ready MCP",
    description:
      "Paste a docs URL. Get a remote MCP server. No install, no API keys.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  maximumScale: 1,
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const geistMono = GeistMono;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${spaceGrotesk.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans font-light antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem
        >
          <TooltipProvider>
            {children}
            <Toaster position="bottom-center" theme="system" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
