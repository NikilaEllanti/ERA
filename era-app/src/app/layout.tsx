import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERA — Architecture Reasoning Engine",
  description: "AI-native distributed systems simulator. Design, simulate, and reason about system architectures with AI-powered engineering copilot.",
  keywords: "system design, architecture, distributed systems, AI, simulation, engineering",
  openGraph: {
    title: "ERA — Architecture Reasoning Engine",
    description: "AI-native distributed systems simulator with architecture generation, deterministic simulation, and AI engineering reasoning.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
