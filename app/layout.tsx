import "@/styles/globals.css";
import { Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />

      <link href="/logo.svg" rel="icon" sizes="any" />
      <title>
        CodeCraft IDE - Online Kodlama Platformu | AI Destekli Çözüm Ortağınız
      </title>
      <meta
        content="CodeCraft IDE, 10+ programlama dili desteğiyle online kodlama yapmanızı sağlayan, yapay zeka destekli, kullanıcı dostu bir platformdur. Kod yaz, analiz et, paylaş ve öğren!"
        name="description"
       />
      <meta
        content="CodeCraft IDE, Online IDE, Kodlama Platformu, Yapay Zeka Kodlama, Programlama Dilleri, Kod Paylaşımı, Kod Analizi"
        name="keywords"
       />
      <meta
        content="CodeCraft IDE - Online Kodlama Platformu"
        property="og:title"
       />
      <meta
        content="Yapay zeka destekli, kullanıcı dostu IDE'mizle kod yazmayı ve paylaşmayı kolaylaştırın. 10+ programlama dili desteğiyle şimdi deneyin!"
        property="og:description"
       />
      <meta content="https://codecraft-ide.com" property="og:url" />
      <meta content="website" property="og:type" />
      <meta
        content="CodeCraft IDE - Online Kodlama Platformu"
        name="twitter:title"
       />
      <meta
        content="Yapay zeka destekli, kullanıcı dostu IDE'mizle kod yazmayı ve paylaşmayı kolaylaştırın. 10+ programlama dili desteğiyle şimdi deneyin!"
        name="twitter:description"
       />
      <link href="https://codecraft-ide.com" rel="canonical" />
      <meta content="index, follow" name="robots" />

      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
