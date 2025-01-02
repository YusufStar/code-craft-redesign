"use client";
import React from "react";
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
import { Select, SelectItem } from "@nextui-org/select";
import { toast } from "sonner";
import { Checkbox } from "@nextui-org/checkbox";
import themeList from "monaco-themes/themes/themelist.json";

import useEditorStore from "@/store/editorStore";
import { axiosInstance } from "@/hooks/useAxios";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EditorSettings = ({ onOpenChange, open }: Props) => {
  const { editorSettings, setEditorSettings } = useEditorStore();
  const [tempSettings, setTempSettings] = React.useState(editorSettings);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setTempSettings(editorSettings);
  }, [editorSettings]);

  const handleSaveSettings = async (onClose: () => void) => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.put(
        "/editor-settings",
        tempSettings
      );

      setEditorSettings(data);
      toast.success("Settings saved successfully.");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const isSaveDisabled = React.useMemo(() => {
    return JSON.stringify(tempSettings) === JSON.stringify(editorSettings);
  }, [tempSettings, editorSettings]);

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
                    value={tempSettings.fontSize.toString()}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        fontSize: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <Slider
                  maxValue={30}
                  minValue={10}
                  size="sm"
                  step={0.5}
                  value={tempSettings.fontSize}
                  onChange={(value) =>
                    setTempSettings({
                      ...tempSettings,
                      fontSize: value as number,
                    })
                  }
                />
              </div>

              {/* Settings content - Tab Size */}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between">
                  <span>Tab Size</span>
                  <Input
                    className="w-16"
                    max={8}
                    min={1}
                    size="sm"
                    type="number"
                    value={tempSettings.tabSize.toString()}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        tabSize: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <Slider
                  maxValue={8}
                  minValue={1}
                  size="sm"
                  step={1}
                  value={tempSettings.tabSize}
                  onChange={(value) =>
                    setTempSettings({
                      ...tempSettings,
                      tabSize: value as number,
                    })
                  }
                />
              </div>

              {/* Settings content - Editor Theme */}
              <Select
                className="w-full"
                label="Select Theme"
                placeholder="Editor Theme"
                selectedKeys={[tempSettings.theme]}
                size="md"
                value={tempSettings.theme}
                onChange={(value) =>
                  setTempSettings({
                    ...tempSettings,
                    theme: value.target.value,
                  })
                }
              >
                {Object.entries(themeList).map(([theme, title]) => (
                  <SelectItem key={theme} className="capitalize" value={theme}>
                    {title}
                  </SelectItem>
                ))}
              </Select>

              {/* Settings content - Word Wrap */}
              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  isSelected={tempSettings.wordWrap}
                  onValueChange={(value) =>
                    setTempSettings({ ...tempSettings, wordWrap: value })
                  }
                >
                  Word Wrap
                </Checkbox>
              </div>

              {/* Settings content - Auto Save */}
              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  isSelected={tempSettings.autoSave}
                  onValueChange={(value) =>
                    setTempSettings({ ...tempSettings, autoSave: value })
                  }
                >
                  Auto Save
                </Checkbox>
              </div>

              {/* Settings content - Line Numbers */}
              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  isSelected={tempSettings.lineNumbers}
                  onValueChange={(value) =>
                    setTempSettings({ ...tempSettings, lineNumbers: value })
                  }
                >
                  Line Numbers
                </Checkbox>
              </div>

              {/* Settings content - Minimap */}
              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  isSelected={tempSettings.minimap}
                  onValueChange={(value) =>
                    setTempSettings({ ...tempSettings, minimap: value })
                  }
                >
                  Minimap
                </Checkbox>
              </div>
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
                isDisabled={isSaveDisabled || isLoading}
                isLoading={isLoading}
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
