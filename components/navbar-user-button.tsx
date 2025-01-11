"use client";

import React from "react";
import {
  Avatar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { LogOut, Settings, UserIcon } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { Link } from "@nextui-org/link";
import { paths } from "@/constants/paths";

const NavbarUserButton = () => {
  const { currentUser, logout } = useAuthStore();

  if (currentUser) {
    return (
      <Popover placement="bottom-end" showArrow={true}>
        <PopoverTrigger>
          <Avatar
            alt={currentUser.username}
            className="cursor-pointer"
            name={currentUser.username}
            size="md"
            src={currentUser?.avatar ?? ""}
          />
        </PopoverTrigger>

        <PopoverContent className="p-2 w-40 gap-1">
          <Button
            className="w-full justify-start"
            color="primary"
            size="md"
            startContent={<UserIcon className="w-4 h-4" />}
            variant="faded"
            onClick={() => {
              console.log("Profile");
            }}
          >
            Profile
          </Button>

          <Button
            className="w-full justify-start"
            color="warning"
            size="md"
            startContent={<Settings className="w-4 h-4" />}
            variant="faded"
            onClick={() => {
              console.log("Settings");
            }}
          >
            Settings
          </Button>

          <Button
            className="w-full justify-start"
            color="danger"
            size="md"
            startContent={<LogOut className="w-4 h-4" />}
            variant="faded"
            onClick={() => logout()}
          >
            Logout
          </Button>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Link href={paths.auth.login}>
      <Button variant="flat">Login</Button>
    </Link>
  );
};

export default NavbarUserButton;
