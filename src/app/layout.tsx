import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import { NProgressProvider } from "@/components/nprogress-provider";
import "@/styles/nprogress.css";
import Providers from "./providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Sahayak AI",
  description: "AI-powered teaching assistant for educators in India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
        suppressHydrationWarning={true}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <NProgressProvider>
                {children}
                <Toaster />
            </NProgressProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
