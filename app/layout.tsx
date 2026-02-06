import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "Saylor Tracker | Bloomberg Terminal",
  description: "Track Michael Saylor's Bitcoin strategy with Bloomberg Terminal aesthetics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${robotoMono.variable} antialiased`}>
        <div className="min-h-screen bg-terminal-black">
          {/* Terminal Header */}
          <header className="border-b border-terminal-orange/30 px-6 py-3 bg-gradient-to-b from-terminal-black to-terminal-black/95">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold plasma-glow text-terminal-orange">
                SAYLOR_TRACKER.TERMINAL
              </h1>
              <div className="flex gap-4 text-sm">
                <span className="text-terminal-orange-dim amber-glow">
                  {new Date().toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-6 py-8 mb-16">
            {children}
          </main>

          {/* Terminal Footer */}
          <footer className="fixed bottom-0 left-0 right-0 border-t border-terminal-orange/30 bg-terminal-black px-6 py-2">
            <div className="flex items-center justify-between text-xs text-terminal-orange-dim amber-glow">
              <span>SYSTEM READY</span>
              <span>LIVE FEED</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
