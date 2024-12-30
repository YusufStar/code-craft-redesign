"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code,
  Rocket,
  UserCog,
  Layout,
  Wand2,
  Cloud,
  GitBranch,
  Terminal,
  Monitor,
  Brush,
} from "lucide-react";
import { Button } from "@nextui-org/button";

const LandingPage = () => {
  return (
    <div className="h-full w-full p-4 relative overflow-hidden flex items-center justify-center">
      {/* Background Gradient */}
      <motion.div
        animate={{ opacity: 0.3 }}
        className="absolute inset-0 bg-gradient-to-bl from-indigo-700 via-purple-700 to-pink-600 opacity-30 blur-3xl"
        initial={{ opacity: 0 }}
        transition={{ duration: 2 }}
      />
      <div className="rounded-xl border border-gray-800 bg-black/80 backdrop-blur-lg shadow-2xl relative z-10 p-8 max-w-6xl w-full">
        {/* Welcome Text and Description */}
        <div className="flex flex-col gap-6 text-center">
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            CodeCraft IDE
          </motion.h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Revolutionize your coding experience with an all-in-one IDE.
            CodeCraft empowers developers with multi-language support, AI-driven
            tools, and a seamless user experience. Join the future of coding
            today.
          </motion.p>
        </div>

        {/* Features */}
        <motion.div
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { Icon: Code, label: "Multi-Language Support" },
            { Icon: Rocket, label: "Real-Time Execution" },
            { Icon: UserCog, label: "User-Friendly Interface" },
            { Icon: Layout, label: "Customizable Layout" },
            { Icon: Wand2, label: "Code Auto-Completion" },
            { Icon: Cloud, label: "Cloud Sync" },
            { Icon: GitBranch, label: "GitHub Integration" },
            { Icon: Terminal, label: "React Compiler" },
            { Icon: Monitor, label: "Live Preview" },
            { Icon: Brush, label: "Customizable Themes" },
          ].map(({ Icon, label }, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 bg-gray-800/50 p-4 rounded-lg shadow-md text-indigo-200 hover:bg-indigo-800/40 transition-all"
            >
              <Icon className="text-sm" />
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-center gap-6 mt-12"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link href="/web-playground">
            <Button color="warning" size="md" variant="bordered">
              Web Playground
            </Button>
          </Link>

          <Link href="/editor">
            <Button color="success" size="md" variant="bordered">
              Start Coding
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
