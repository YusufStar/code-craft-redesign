"use client";

import React from "react";
import { Button, Link, User } from "@nextui-org/react";
import { Blocks } from "lucide-react";

export default function VerifyEmailView() {
  return (
    <div className="relative flex min-h-screen max-h-screen overflow-hidden h-full w-full">
      {/* Brand Logo */}
      <div className="absolute left-2 top-5 lg:left-5">
        <div className="flex items-center gap-2">
          <Blocks className="size-6 text-blue-400" />
          <p className="font-medium">Code Craft</p>
        </div>
      </div>

      {/* Verify Email Content */}
      <div className="flex w-full items-center justify-center bg-background lg:w-1/2">
        <div className="flex w-full max-w-sm flex-col items-center gap-6 p-4">
          <div className="text-center">
            <p className="pb-2 text-xl font-medium">
              E-posta Adresinizi Doğrulayın
            </p>
            <p className="text-small text-default-500">
              Kaydınızı tamamlamak için lütfen e-posta adresinize gönderilen
              doğrulama bağlantısına tıklayın.
            </p>
          </div>
          <Button as={Link} href="#" color="primary">
            Doğrulama E-postasını Yeniden Gönder
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
          <User
            avatarProps={{
              src: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
            }}
            classNames={{
              base: "flex flex-row-reverse",
              name: "w-full text-right text-black",
              description: "text-black/80",
            }}
            description="Founder & CEO at Code Craft"
            name="Yusuf Star"
          />
          <p className="w-full text-right text-2xl text-black/60">
            <span className="font-medium">“</span>
            <span className="font-normal italic">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget
              augue nec massa volutpat aliquet.
            </span>
            <span className="font-medium">”</span>
          </p>
        </div>
      </div>
    </div>
  );
}
