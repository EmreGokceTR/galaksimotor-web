"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { EditModeProvider } from "@/context/EditModeContext";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {/* refetchInterval: 0 ve refetchOnWindowFocus: false →
          session endpoint sürekli yeniden çağrılmasın. Vercel rate limit'i
          ve gereksiz network trafiğini önler. Session değişikliği zaten
          login/logout sonrası hard navigation ile yenilenir. */}
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
        <EditModeProvider>{children}</EditModeProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
