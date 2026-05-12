import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import AIContainer from "@/components/ai/AIContainer";

export const metadata: Metadata = {
  title: "Synapse AI Task Manager",
  description: "Advanced AI-powered task management for teams",
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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <div className="flex h-screen w-screen overflow-hidden">
            <main className="flex-grow overflow-hidden relative">
              {children}
            </main>
            <AIContainer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
