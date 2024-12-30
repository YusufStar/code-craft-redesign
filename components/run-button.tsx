"use client";

import { Loader2, Lock, Play, Sparkles } from "lucide-react";
import { Button } from "@nextui-org/button";
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Select, SelectItem, SelectSection } from "@nextui-org/select";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { FileType } from "./MultiFileSelect";

import useFileStore from "@/store/fileStore";

function RunButton({ small }: { small?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RunDialog open={open} onChange={(newVal: boolean) => setOpen(newVal)} />

      {small ? (
        <Button
          isIconOnly
          aria-label="run"
          color="primary"
          radius="full"
          size="md"
          onClick={() => setOpen(true)}
        >
          <div className="relative flex items-center justify-center w-4 h-4">
            <Play className="w-4 h-4 text-white/90 transition-transform group-hover:scale-110 group-hover:text-white" />
          </div>
        </Button>
      ) : (
        <Button
          color="primary"
          size="md"
          variant="bordered"
          onClick={() => setOpen(true)}
        >
          <div className="relative flex items-center justify-center w-4 h-4">
            <Play className="w-4 h-4 text-white/90 transition-transform group-hover:scale-110 group-hover:text-white" />
          </div>
          <span className="text-sm font-medium text-white/90 group-hover:text-white">
            Run Code
          </span>
        </Button>
      )}
    </>
  );
}

function RunDialog({
  open,
  onChange,
}: {
  open: boolean;
  onChange: (newVal: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<{
    executionType: string;
    executionFiles: FileType[];
    runType: "ui_component" | "console_app";
  }>({
    executionType: "",
    executionFiles: [],
    runType: "console_app",
  });
  const isPro = false;
  const { getFiles } = useFileStore();
  const files = getFiles();

  const handleChange = (key: string, value: FileType[] | string) => {
    setStates((prev) => ({ ...prev, [key]: value as any }));
  };

  useEffect(() => {
    if (!isPro && states.executionFiles.length > 1) {
      setStates((prev) => ({
        ...prev,
        executionFiles: [prev.executionFiles[prev.executionFiles.length - 1]],
      }));
    }
  }, [states.executionFiles, isPro]);

  const handleRun = (onClose: () => void) => {
    setLoading(true);

    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve("Code ran successfully!");
          setLoading(false);
          onClose();
        }, 2000);
      }),
      {
        loading: "Running code...",
        success: "Code ran successfully!",
        error: "Failed to run code!",
      }
    );
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={(val) => {
        setStates({
          executionType: "",
          executionFiles: [],
          runType: "console_app",
        });
        onChange(val);
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Execution Settings</ModalHeader>

            <div className="flex flex-col gap-4 px-4">
              <Select
                disabled={loading}
                label="Execution Type"
                placeholder="Select an option"
                size="sm"
                value={states.executionType}
                onChange={(e) => {
                  handleChange("executionType", e.target.value);
                  setStates((prev) => ({
                    ...prev,
                    executionFiles: [],
                    runType: "console_app",
                  }));
                }}
              >
                <SelectSection>
                  <SelectItem
                    key="one_file"
                    isDisabled={loading}
                    startContent={
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    }
                    value="one_file"
                  >
                    One File
                  </SelectItem>
                  <SelectItem
                    key="all_project"
                    isDisabled={loading || !isPro}
                    startContent={
                      isPro ? (
                        <Sparkles className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-500" />
                      )
                    }
                    value="all_project"
                  >
                    All Project
                  </SelectItem>
                </SelectSection>
              </Select>

              <AnimatePresence mode="wait">
                {states.executionType === "one_file" && (
                  <motion.div
                    key={"one_file" + "execution file"}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                  >
                    <Select
                      disabled={loading}
                      label="Execution File"
                      placeholder="Select an option"
                      size="sm"
                      value={states.executionFiles[0]?.name}
                      onChange={(e) => {
                        const selectedFile = files.find(
                          (file) => file.name === e.target.value
                        );

                        if (selectedFile) {
                          handleChange("executionFiles", [selectedFile]);
                        }
                      }}
                    >
                      <SelectSection>
                        {files.map((file) => (
                          <SelectItem
                            key={file.name}
                            isDisabled={loading}
                            value={file.name}
                          >
                            {file.name}
                          </SelectItem>
                        ))}
                      </SelectSection>
                    </Select>
                  </motion.div>
                )}

                {states.executionType === "all_project" && isPro && (
                  <motion.div
                    key={"all_project" + "main_file"}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                  >
                    <Select
                      description="Select the main file to run"
                      disabled={loading}
                      label="Main File"
                      placeholder="Select an option"
                      size="sm"
                      value={states.executionFiles[0]?.name}
                      onChange={(e) => {
                        const selectedFile = files.find(
                          (file) => file.name === e.target.value
                        );

                        if (selectedFile) {
                          handleChange("executionFiles", [selectedFile]);
                        }
                      }}
                    >
                      <SelectSection>
                        {files.map((file) => (
                          <SelectItem
                            key={file.name}
                            isDisabled={loading}
                            value={file.name}
                          >
                            {file.name}
                          </SelectItem>
                        ))}
                      </SelectSection>
                    </Select>
                  </motion.div>
                )}

                <motion.div
                  key={"all_project" + "run_type"}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Select
                    description="Select the type of project to run"
                    disabled={loading}
                    label="Run Type"
                    placeholder="Select an option"
                    size="sm"
                    value={states.runType}
                    onChange={(e) => {
                      handleChange("runType", e.target.value);
                    }}
                  >
                    <SelectSection>
                      <SelectItem
                        key="ui_component"
                        isDisabled={loading || !isPro}
                        startContent={
                          isPro ? (
                            <Sparkles className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-500" />
                          )
                        }
                        value="ui_component"
                      >
                        UI Component
                      </SelectItem>
                      <SelectItem
                        key="console_app"
                        isDisabled={loading}
                        startContent={
                          <Sparkles className="w-4 h-4 text-blue-600" />
                        }
                        value="console_app"
                      >
                        Console App
                      </SelectItem>
                    </SelectSection>
                  </Select>
                </motion.div>
              </AnimatePresence>
            </div>

            <ModalFooter>
              <Button
                color="danger"
                disabled={loading}
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                disabled={loading}
                size="sm"
                onClick={() => handleRun(onClose)}
              >
                {loading ? (
                  <div className="relative flex items-center justify-center w-4 h-4">
                    <Loader2 className="w-4 h-4 text-white/90 animate-spin" />
                  </div>
                ) : (
                  <span className="text-sm font-medium text-white/90 group-hover:text-white">
                    Run
                  </span>
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default RunButton;
