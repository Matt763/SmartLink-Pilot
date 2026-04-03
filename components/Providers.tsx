"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // refetchOnWindowFocus: false — avoids a /api/auth/session request every
    // time the user alt-tabs back, which adds latency on slow connections.
    <SessionProvider refetchOnWindowFocus={false}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
