"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Slider } from "@nextui-org/slider";
import { Input } from "@nextui-org/input";
import { Select, SelectSection, SelectItem } from "@nextui-org/select";
import { Avatar } from "@nextui-org/react";
import { toast } from "sonner";

import { languageIcons } from "@/constants/icons";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EditorSettings = ({ onOpenChange, open }: Props) => {
  const [settings, setSettings] = useState<{
    fontSize: number;
    language: string;
    theme: string;
  }>({
    fontSize: 14,
    language: "javascript",
    theme: "dark-plus",
  });

  const handleChangeSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = (onClose: () => void) => {
    toast.success("Settings saved successfully.");
    onClose();
  };

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Editor Settings
            </ModalHeader>
            <ModalBody>
              {/* Settings content - Font Size Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span>Font Size</span>
                  <Input
                    className="w-16"
                    max={30}
                    min={10}
                    size="sm"
                    type="number"
                    value={settings.fontSize.toString()}
                    onChange={(e) =>
                      handleChangeSetting("fontSize", e.target.value)
                    }
                  />
                </div>
                <Slider
                  maxValue={30}
                  minValue={10}
                  size="sm"
                  step={0.5}
                  value={settings.fontSize}
                  onChange={(value) => handleChangeSetting("fontSize", value)}
                />
              </div>

              {/* Settings content - Editor Language */}
              <Select
                className="w-full"
                label="Select Language"
                placeholder="Editor Language"
                size="md"
                value={settings.language}
                onChange={(value) => handleChangeSetting("language", value)}
              >
                <SelectSection>
                  {Object.keys(languageIcons).map((lang) => (
                    <SelectItem
                      key={lang}
                      startContent={
                        <Avatar
                          alt={lang}
                          className="w-6 h-6"
                          src={languageIcons[lang]}
                        />
                      }
                      value={lang}
                    >
                      {lang}
                    </SelectItem>
                  ))}
                </SelectSection>
              </Select>

              {/* Settings content - Editor Theme */}
              <Select
                className="w-full"
                label="Select Theme"
                placeholder="Editor Theme"
                size="md"
                value={settings.theme}
                onChange={(value) => handleChangeSetting("theme", value)}
              >
                <SelectSection>
                  <SelectItem value="dark-plus">Dark</SelectItem>
                  <SelectItem value="vs-light">Light</SelectItem>
                </SelectSection>
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                size="sm"
                variant="light"
                onPress={onClose}
              >
                Close
              </Button>
              <Button
                color="primary"
                size="sm"
                onPress={() => handleSaveSettings(onClose)}
              >
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditorSettings;
