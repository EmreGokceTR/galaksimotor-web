"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { EditModeProvider } from "@/context/EditModeContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <EditModeProvider>{children}</EditModeProvider>
    </SessionProvider>
  );
}
