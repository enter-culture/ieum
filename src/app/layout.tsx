import "./globals.css";
import type { Metadata } from "next";
import { SWRProvider } from "@/shared/lib/swr-provider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "이음",
  description: "우리 무형문화재를 숏폼으로 만나다",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body className="relative bg-black">
        <Suspense fallback={null}>
          <SWRProvider>
            <main className="bg-black w-full h-dvh overflow-y-auto">
              {children}
            </main>
          </SWRProvider>
        </Suspense>
      </body>
    </html>
  );
}
