"use client";

import React from "react";
import { Button, Link } from "@nextui-org/react";
import { Blocks } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen max-h-screen overflow-hidden h-full w-full">
      {/* Brand Logo */}
      <div className="absolute left-2 top-5 lg:left-5">
        <div className="flex items-center gap-2">
          <Blocks className="size-6 text-blue-400" />
          <p className="font-medium">Code Craft</p>
        </div>
      </div>

      {/* 404 Content */}
      <div className="flex w-full items-center justify-center bg-background lg:w-1/2">
        <div className="flex w-full max-w-sm flex-col items-center gap-6 p-4">
          <div className="text-center">
            <p className="text-7xl font-bold text-primary">404</p>
            <p className="pb-2 text-xl font-medium">Sayfa Bulunamadı</p>
            <p className="text-small text-default-500">
              Aradığınız sayfa mevcut değil. Lütfen URL'yi kontrol edin veya
              aşağıdaki butona tıklayarak ana sayfaya dönün.
            </p>
          </div>
          <Button as={Link} href="/" color="primary">
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>

      {/* Right side */}
      <div
        className="relative hidden w-1/2 flex-col-reverse rounded-medium p-10 shadow-small lg:flex"
        style={{
          backgroundImage:
            "url(https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/white-building.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col items-end gap-4">
          {/* You can add some informational content here if needed */}
        </div>
      </div>
    </div>
  );
} 