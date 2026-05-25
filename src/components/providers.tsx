"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { EditModeProvider } from "@/context/EditModeContext";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <EditModeProvider>{children}</EditModeProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
