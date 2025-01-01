"use client";

import { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  Settings,
  Sidebar,
  Folder,
  Terminal,
  FileText,
  PlusCircle,
  FolderPlus,
  Code,
  CheckCircle,
  LayoutIcon,
  X,
} from "lucide-react";

const steps = [
  () => (
    <>
      <div className="flex items-center gap-3">
        <strong className="text-lg flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          Welcome to CodeCraft IDE!
        </strong>
      </div>
      <p className="mt-2 text-gray-400">
        Dive into the next generation of coding with{" "}
        <strong>CodeCraft IDE</strong>. This quick tour will guide you through
        the features that make coding seamless, efficient, and enjoyable.
      </p>
    </>
  ),
  () => (
    <>
      <div className="flex items-center gap-3">
        <strong className="text-lg flex items-center gap-2">
          <Sidebar className="w-5 h-5 text-green-500" />
          Opening the Sidebar
        </strong>
      </div>
      <p className="mt-2 text-gray-400">
        Access powerful tools and settings from the sidebar. Click the{" "}
        <strong>menu icon</strong> in the top-left corner to open it.
      </p>
      <ul className="mt-2 pl-5 list-disc text-gray-300">
        <li>File Management</li>
        <li>Theme Customization</li>
        <li>Debugging Tools</li>
      </ul>
    </>
  ),
  () => (
    <>
      <div className="flex items-center gap-3">
        <strong className="text-lg flex items-center gap-2">
          <Folder className="w-5 h-5 text-yellow-500" />
          File Manager
        </strong>
      </div>
      <p className="mt-2 text-gray-400">
        Organize your projects with ease. Use the <strong>File Manager</strong>{" "}
        to create, rename, or delete files and folders. Keep your workspace tidy
        and productive.
      </p>
    </>
  ),
  () => (
    <>
      <div className="flex items-center gap-3">
        <strong className="text-lg flex items-center gap-2">
          <Terminal className="w-5 h-5 text-purple-500" />
          Output Panel
        </strong>
      </div>
      <p className="mt-2 text-gray-400">
        View execution results and debugging information in the{" "}
        <strong>Output Panel</strong>. Easily track errors and optimize your
        code.
      </p>
      <p className="mt-2 text-gray-400">
        Look for it at the bottom section of the sidebar.
      </p>
    </>
  ),
  () => (
    <>
      <div className="flex items-center gap-3">
        <strong className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-pink-500" />
          File Organization
        </strong>
      </div>
      <p className="mt-2 text-gray-400">
        Learn to manage your files effectively. Drag and drop to reorganize, or
        use the context menu for advanced options.
      </p>
    </>
  ),
  () => (
    <>
      <div className="flex items-center gap-3">
        <strong className="text-lg flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-500" />
          Create a Root File
        </strong>
      </div>
      <p className="mt-2 text-gray-400">
        Kickstart your project by creating a <strong>root file</strong>. This
        serves as the entry point for your codebase.
      </p>
    </>
  ),
  () => (
    <>
      <div className="flex items-center gap-3">
        <strong className="text-lg flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-orange-500" />
          Managing Folders
        </strong>
      </div>
      <p className="mt-2 text-gray-400">
        Create, rename, or delete folders with a simple right-click. Organize
        your workspace and keep everything in place.
      </p>
    </>
  ),
  () => (
    <>
      <div className="flex items-center gap-3">
        <strong className="text-lg flex items-center gap-2">
          <Code className="w-5 h-5 text-teal-500" />
          The Editor
        </strong>
      </div>
      <p className="mt-2 text-gray-400">
        This is the heart of <strong>CodeCraft IDE</strong>. Write, edit, and
        debug your code seamlessly in our intuitive editor.
      </p>
      <p className="mt-2 text-gray-400">
        Syntax highlighting, autocompletion, and intelligent suggestions make
        coding faster and more enjoyable.
      </p>
    </>
  ),
  () => (
    <>
      <div className="flex items-center gap-3">
        <strong className="text-lg flex items-center gap-2">
          <LayoutIcon className="w-5 h-5 text-cyan-500" />
          File Tabs
        </strong>
      </div>
      <p className="mt-2 text-gray-400">
        Switch between open files using tabs. Double-click a tab to pin it, or
        close it with the <X className="w-3 h-3 text-gray-400 inline-block" />{" "}
        icon.
      </p>
    </>
  ),
  () => (
    <>
      <div className="flex items-center gap-3">
        <strong className="text-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Tour Complete
        </strong>
      </div>
      <p className="mt-2 text-gray-400">
        You{`'`}re all set to explore <strong>CodeCraft IDE</strong>. Dive in
        and start coding with ease and confidence.
      </p>
      <p className="mt-2 text-gray-400">
        Need help? Access the documentation or contact support anytime!
      </p>
    </>
  ),
];

interface TourModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TourModal: React.FC<TourModalProps> = ({ open, onOpenChange }) => {
  const [tourStep, setTourStep] = useState(0);

  const handleNextStep = () => {
    if (tourStep < steps.length - 1) {
      setTourStep((prev) => prev + 1);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>CodeCraft IDE Introduction</ModalHeader>
        <motion.div
          layout
          animate={{ height: "auto" }}
          initial={{ height: "auto" }}
          style={{
            overflow: "hidden",
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.3,
          }}
        >
          <ModalBody>
            <div
              style={{
                color: "#EAEAEA",
                lineHeight: "1.6",
                fontSize: "16px",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={tourStep}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  initial={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                >
                  {steps[tourStep]()}
                </motion.div>
              </AnimatePresence>
            </div>
          </ModalBody>
        </motion.div>
        <ModalFooter>
          <Button color="primary" onClick={handleNextStep}>
            {tourStep < steps.length - 1 ? "Next" : "Close"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TourModal; 