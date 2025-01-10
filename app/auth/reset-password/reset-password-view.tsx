"use client";

import React from "react";
import { Button, Input, User } from "@nextui-org/react";
import { Blocks } from "lucide-react";
import { Icon } from "@iconify/react";
import { useSearchParams } from "next/navigation";
import { paths } from "@/constants/paths";
import { Link } from "@nextui-org/link";

export default function ResetPasswordView() {
  const [isVisible, setIsVisible] = React.useState(false);
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("resetToken");
  const [email, setEmail] = React.useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handlePasswordReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Şifre sıfırlama isteği gönderildi.");
  };

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Şifre sıfırlama e-postası gönderme isteği gönderildi:", email);
    // Burada e-posta gönderme mantığını uygulayabilirsiniz.
  };

  return (
    <div className="relative flex min-h-screen max-h-screen overflow-hidden h-full w-full">
      {/* Brand Logo */}
      <div className="absolute left-2 top-5 lg:left-5">
        <div className="flex items-center gap-2">
          <Blocks className="size-6 text-blue-400" />
          <p className="font-medium">Code Craft</p>
        </div>
      </div>

      {/* Reset Password Form */}
      <div className="flex w-full items-center justify-center bg-background lg:w-1/2">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 p-4">
          <div className="w-full text-left">
            <p className="pb-2 text-xl font-medium">
              {resetToken
                ? "Şifreni Sıfırla"
                : "Şifre Sıfırlama E-postası Gönder"}
            </p>
            <span className="text-small text-default-500">
              {resetToken
                ? "Yeni şifrenizi oluşturmak için aşağıdaki formu doldurun."
                : "Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin."}
            </span>
          </div>

          <form
            className="flex w-full flex-col gap-3"
            onSubmit={resetToken ? handlePasswordReset : handleEmailSubmit}
          >
            {!resetToken ? (
              <Input
                isRequired
                label="E-posta Adresi"
                name="email"
                placeholder="E-posta adresinizi girin"
                type="email"
                variant="underlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            ) : (
              <>
                <Input
                  isRequired
                  label="Yeni Şifre"
                  name="password"
                  placeholder="Yeni şifrenizi girin"
                  type={isVisible ? "text" : "password"}
                  variant="underlined"
                  endContent={
                    <button type="button" onClick={toggleVisibility}>
                      {isVisible ? (
                        <Icon
                          className="pointer-events-none text-2xl text-default-400"
                          icon="solar:eye-closed-linear"
                        />
                      ) : (
                        <Icon
                          className="pointer-events-none text-2xl text-default-400"
                          icon="solar:eye-bold"
                        />
                      )}
                    </button>
                  }
                />
                <Input
                  isRequired
                  label="Şifreyi Onayla"
                  name="confirmPassword"
                  placeholder="Yeni şifrenizi tekrar girin"
                  type={isVisible ? "text" : "password"}
                  variant="underlined"
                  endContent={
                    <button type="button" onClick={toggleVisibility}>
                      {isVisible ? (
                        <Icon
                          className="pointer-events-none text-2xl text-default-400"
                          icon="solar:eye-closed-linear"
                        />
                      ) : (
                        <Icon
                          className="pointer-events-none text-2xl text-default-400"
                          icon="solar:eye-bold"
                        />
                      )}
                    </button>
                  }
                />
              </>
            )}
            <Button color="primary" type="submit">
              {resetToken ? "Şifreyi Sıfırla" : "E-posta Gönder"}
            </Button>
          </form>
          <p className="text-center text-small">
            Return to login&nbsp;
            <Link href={paths.auth.login} size="sm">
              Log In
            </Link>
          </p>
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
