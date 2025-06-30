"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ReduxProvider } from "@/components/providers/reduxProvider";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@/redux/store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
