"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
} from "@nextui-org/navbar";
import NextLink from "next/link";
import {
  Blocks,
  Code2,
  DockIcon,
  Laptop,
  Sparkles,
  WebhookIcon,
} from "lucide-react";
import { Link } from "@nextui-org/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import RunButton from "./run-button";
import NavbarUserButton from "./navbar-user-button";

export const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/editor",
      label: "Editor",
      icon: Laptop,
    },
    {
      href: "/snippets",
      label: "Snippets",
      icon: Code2,
    },
    {
      href: "/problems",
      label: "Problems",
      icon: DockIcon,
    },
    {
      href: "/web-playground",
      label: "Web Playground",
      icon: WebhookIcon,
    },
    {
      href: "/react-editor",
      label: "React Editor",
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-gray-400 group-hover:text-gray-200 transition-colors duration-200"
          viewBox="0 0 128 128"
        >
          <g fill="#61DAFB">
            <circle cx="64" cy="64" r="11.4" />
            <path d="M107.3 45.2c-2.2-.8-4.5-1.6-6.9-2.3.6-2.4 1.1-4.8 1.5-7.1 2.1-13.2-.2-22.5-6.6-26.1-1.9-1.1-4-1.6-6.4-1.6-7 0-15.9 5.2-24.9 13.9-9-8.7-17.9-13.9-24.9-13.9-2.4 0-4.5.5-6.4 1.6-6.4 3.7-8.7 13-6.6 26.1.4 2.3.9 4.7 1.5 7.1-2.4.7-4.7 1.4-6.9 2.3C8.2 50 1.4 56.6 1.4 64s6.9 14 19.3 18.8c2.2.8 4.5 1.6 6.9 2.3-.6 2.4-1.1 4.8-1.5 7.1-2.1 13.2.2 22.5 6.6 26.1 1.9 1.1 4 1.6 6.4 1.6 7.1 0 16-5.2 24.9-13.9 9 8.7 17.9 13.9 24.9 13.9 2.4 0 4.5-.5 6.4-1.6 6.4-3.7 8.7-13 6.6-26.1-.4-2.3-.9-4.7-1.5-7.1 2.4-.7 4.7-1.4 6.9-2.3 12.5-4.8 19.3-11.4 19.3-18.8s-6.8-14-19.3-18.8zM92.5 14.7c4.1 2.4 5.5 9.8 3.8 20.3-.3 2.1-.8 4.3-1.4 6.6-5.2-1.2-10.7-2-16.5-2.5-3.4-4.8-6.9-9.1-10.4-13 7.4-7.3 14.9-12.3 21-12.3 1.3 0 2.5.3 3.5.9zM81.3 74c-1.8 3.2-3.9 6.4-6.1 9.6-3.7.3-7.4.4-11.2.4-3.9 0-7.6-.1-11.2-.4-2.2-3.2-4.2-6.4-6-9.6-1.9-3.3-3.7-6.7-5.3-10 1.6-3.3 3.4-6.7 5.3-10 1.8-3.2 3.9-6.4 6.1-9.6 3.7-.3 7.4-.4 11.2-.4 3.9 0 7.6.1 11.2.4 2.2 3.2 4.2 6.4 6 9.6 1.9 3.3 3.7 6.7 5.3 10-1.7 3.3-3.4 6.6-5.3 10zm8.3-3.3c1.5 3.5 2.7 6.9 3.8 10.3-3.4.8-7 1.4-10.8 1.9 1.2-1.9 2.5-3.9 3.6-6 1.2-2.1 2.3-4.2 3.4-6.2zM64 97.8c-2.4-2.6-4.7-5.4-6.9-8.3 2.3.1 4.6.2 6.9.2 2.3 0 4.6-.1 6.9-.2-2.2 2.9-4.5 5.7-6.9 8.3zm-18.6-15c-3.8-.5-7.4-1.1-10.8-1.9 1.1-3.3 2.3-6.8 3.8-10.3 1.1 2 2.2 4.1 3.4 6.1 1.2 2.2 2.4 4.1 3.6 6.1zm-7-25.5c-1.5-3.5-2.7-6.9-3.8-10.3 3.4-.8 7-1.4 10.8-1.9-1.2 1.9-2.5 3.9-3.6 6-1.2 2.1-2.3 4.2-3.4 6.2zM64 30.2c2.4 2.6 4.7 5.4 6.9 8.3-2.3-.1-4.6-.2-6.9-.2-2.3 0-4.6.1-6.9.2 2.2-2.9 4.5-5.7 6.9-8.3zm22.2 21l-3.6-6c3.8.5 7.4 1.1 10.8 1.9-1.1 3.3-2.3 6.8-3.8 10.3-1.1-2.1-2.2-4.2-3.4-6.2zM31.7 35c-1.7-10.5-.3-17.9 3.8-20.3 1-.6 2.2-.9 3.5-.9 6 0 13.5 4.9 21 12.3-3.5 3.8-7 8.2-10.4 13-5.8.5-11.3 1.4-16.5 2.5-.6-2.3-1-4.5-1.4-6.6zM7 64c0-4.7 5.7-9.7 15.7-13.4 2-.8 4.2-1.5 6.4-2.1 1.6 5 3.6 10.3 6 15.6-2.4 5.3-4.5 10.5-6 15.5C15.3 75.6 7 69.6 7 64zm28.5 49.3c-4.1-2.4-5.5-9.8-3.8-20.3.3-2.1.8-4.3 1.4-6.6 5.2 1.2 10.7 2 16.5 2.5 3.4 4.8 6.9 9.1 10.4 13-7.4 7.3-14.9 12.3-21 12.3-1.3 0-2.5-.3-3.5-.9zM96.3 93c1.7 10.5.3 17.9-3.8 20.3-1 .6-2.2.9-3.5.9-6 0-13.5-4.9-21-12.3 3.5-3.8 7-8.2 10.4-13 5.8-.5 11.3-1.4 16.5-2.5.6 2.3 1 4.5 1.4 6.6zm9-15.6c-2 .8-4.2 1.5-6.4 2.1-1.6-5-3.6-10.3-6-15.6 2.4-5.3 4.5-10.5 6-15.5 13.8 4 22.1 10 22.1 15.6 0 4.7-5.8 9.7-15.7 13.4z" />
          </g>
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full px-6">
      <NextUINavbar
        maxWidth="full"
        position="sticky"
        style={{
          borderRadius: "0 0 1rem 1rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            {/* LOGO */}
            <NextLink
              className="flex justify-start items-center gap-3 group relative"
              href="/"
            >
              <div
                className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 
              group-hover:opacity-100 transition-all duration-500 blur-xl"
              />

              {/* Logo */}
              <div
                className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1
            ring-white/10 group-hover:ring-white/20 transition-all"
              >
                <Blocks className="size-6 text-blue-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
              </div>

              <div className="flex flex-col">
                <span className="block text-lg font-semibold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 text-transparent bg-clip-text">
                  Code Craft IDE
                </span>
                <span className="block text-xs text-blue-400/60 font-medium">
                  Interactive Code Editor
                </span>
              </div>
            </NextLink>
          </NavbarBrand>

          <ul className="hidden lg:flex items-center gap-6 ml-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <NextLink
                  key={link.href}
                  className={`group flex items-center gap-2 relative py-2
                    ${
                      isActive
                        ? "text-blue-400"
                        : "text-gray-400 hover:text-gray-200"
                    }
                    transition-colors duration-200`}
                  href={link.href}
                >
                  <Icon
                    className={`w-4 h-4 group-hover:rotate-3 transition-transform
                    ${isActive ? "text-blue-400" : "group-hover:text-gray-200"}`}
                  />
                  <span className="text-sm font-medium">{link.label}</span>

                  {/* Aktif link için alt çizgi */}
                  <div
                    className={`absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full
                    ${
                      isActive
                        ? "bg-blue-400 w-full"
                        : "bg-blue-400/40 w-0 group-hover:w-full"
                    }
                    transition-all duration-300`}
                  />
                </NextLink>
              );
            })}
          </ul>
        </NavbarContent>

        <NavbarContent className="basis-1/5 gap-0 sm:basis-full" justify="end">
          <AnimatePresence>
            {
              // Run Button
              pathname === "/editor" && (
                <motion.div
                  key="run-button"
                  animate={{ opacity: 1, scale: 1 }}
                  className="mr-4"
                  exit={{ opacity: 0, scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <RunButton />
                </motion.div>
              )
            }
          </AnimatePresence>

          <Link
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-r from-amber-500/10 
              to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 
              transition-all duration-300"
            href="/pricing"
          >
            <Sparkles className="w-4 h-4 text-amber-400 hover:text-amber-300" />
            <span className="text-sm font-medium text-amber-400/90 hover:text-amber-300">
              Pro
            </span>
          </Link>

          <div className="w-0.5 h-6 bg-gray-400/20 mx-3" />

          <NavbarUserButton />
        </NavbarContent>
      </NextUINavbar>
    </div>
  );
};
