"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            color: "#15192c",
            border: "1px solid #ececec",
          },
          className: "sonner-toast",
        }}
      />
    </SessionProvider>
  );
}
