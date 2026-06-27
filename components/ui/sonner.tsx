"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          color: "var(--ink)",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-hanken)",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
