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
