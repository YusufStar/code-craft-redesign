"use client";

import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Terminal, BrainCircuit, Users } from "lucide-react";
import clsx from "clsx";
import { Button } from "@nextui-org/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from "@nextui-org/drawer";

import OutputTab from "./panel-tabs/OutputTab";
import AIChatTab from "./panel-tabs/AIChatTab";
import CollaborationTab from "./panel-tabs/CollaborationTab";
import FileManagerTab from "./panel-tabs/FileManagerTab";

import useEditorStore from "@/store/editorStore";

type TabType = "files" | "output" | "ai" | "collaboration";

export default function RightPanel() {
  const { activeTab, setActiveTab, isRightPanelOpen, setIsRightPanelOpen } =
    useEditorStore();

  const tabs = [
    {
      id: "files",
      label: "File Manager",
      icon: <Terminal className="w-4 h-4 flex-shrink-0 shrink-0" />,
      component: <FileManagerTab />,
    },
    {
      id: "output",
      label: "Output",
      icon: <Terminal className="w-4 h-4 flex-shrink-0 shrink-0" />,
      component: <OutputTab />,
    },
    {
      id: "ai",
      label: "AI Chat",
      icon: <BrainCircuit className="w-4 h-4 flex-shrink-0 shrink-0" />,
      component: <AIChatTab />,
    },
    {
      id: "collaboration",
      label: "Collaboration",
      icon: <Users className="w-4 h-4 flex-shrink-0 shrink-0" />,
      component: <CollaborationTab />,
    },
  ];

  return (
    <>
      {/* Button to open the panel, positioned vertically centered */}
      <AnimatePresence>
        {!isRightPanelOpen && (
          <Button
            isIconOnly
            animate={{ right: -16, scale: 1, opacity: 1 }}
            as={motion.button}
            className={`
          fixed animate-pulse top-1/2 z-20 -right-4 bg-[#4f4f4f] text-white p-3 transition-all duration-300 transform -translate-y-1/2
          `}
            exit={{ right: 0, scale: 1, opacity: 0 }}
            initial={{ right: 0, scale: 1 }}
            radius="full"
            style={{
              boxShadow:
                "0 0 10px 0 rgba(0, 0, 0, 0.2), 0 0 20px 0 rgba(0, 0, 0, 0.1)",
            }}
            whileHover={{ scale: 1.1, right: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          >
            <ChevronLeft
              className={`
          w-8 h-8 transform transition-transform duration-300
          `}
            />
          </Button>
        )}
      </AnimatePresence>

      {/* Sliding panel */}
      <Drawer
        isOpen={isRightPanelOpen}
        motionProps={{
          variants: {
            enter: {
              opacity: 1,
              x: 0,
            },
            exit: {
              x: 100,
              opacity: 0,
            },
          },
          transition: { duration: 0.3 },
        }}
        onOpenChange={setIsRightPanelOpen}
      >
        <DrawerContent>
          <DrawerHeader className="flex flex-col gap-1">
            Custom Motion Drawer
          </DrawerHeader>

          <DrawerBody>
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  className={clsx(
                    "flex items-center gap-2 rounded-md",
                    activeTab === tab.id && "bg-[#4f4f4f] text-white"
                  )}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  {tab.icon}
                  <span className="hidden sm:block">{tab.label}</span>
                </Button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tabs.map(
                (tab) =>
                  activeTab === tab.id && (
                    <motion.div
                      key={tab.id}
                      animate={{ opacity: 1 }}
                      className="h-full"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                    >
                      {tab.component}
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
