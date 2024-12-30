"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import { Spinner } from "@nextui-org/react";

import { AxiosProvider } from "@/hooks/useAxios";
import { useAuthStore } from "@/store/authStore";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const { loading } = useAuthStore();

  return (
    <NextUIProvider navigate={router.push}>
      <AxiosProvider>
        <NextThemesProvider {...themeProps}>
          <Toaster duration={5000} position="bottom-right" theme="dark" />
          {loading ? (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 9999,
              }}
            >
              <Spinner size="lg" />
            </div>
          ) : (
            children
          )}
        </NextThemesProvider>
      </AxiosProvider>
    </NextUIProvider>
  );
}
