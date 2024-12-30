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
import { Input } from "@nextui-org/input";
import { toast } from "sonner";

import MultiFileSelect from "../MultiFileSelect";

import useFileStore from "@/store/fileStore";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ShareSnippet = ({ onOpenChange, open }: Props) => {
  const [selectedFiles, setSelectedFiles] = useState<
    {
      name: string;
      type: "file";
      content: string;
    }[]
  >([]);
  const [snippetName, setSnippetName] = useState("");
  const { getFiles } = useFileStore();

  const handleFileSelect = (
    files:
      | {
          name: string;
          type: "file";
          content: string;
        }[]
      | null
  ) => {
    if (files) {
      setSelectedFiles(files);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleShareSnippet = (onClose: () => void) => {
    console.log("Snippet Name: ", snippetName);
    console.log("Selected Files: ", selectedFiles);
    toast.success("Snippet shared successfully!", {
      description: `Snippet \`${snippetName}\` shared successfully!`,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        setSnippetName("");
        setSelectedFiles([]);
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Editor Settings
            </ModalHeader>
            <ModalBody>
              {/* Share Snippet -  */}
              <Input
                label="Snippet Name"
                placeholder="Enter Snippet name"
                size="sm"
                value={snippetName}
                variant="faded"
                onChange={(e) => setSnippetName(e.target.value)}
              />

              {/* Share Snippet - Files Multi Select */}
              <div className="flex flex-col gap-2">
                <span className="text-sm">Snippet Files</span>

                <MultiFileSelect
                  files={getFiles()}
                  onFileSelect={handleFileSelect}
                />
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
                size="sm"
                onPress={() => handleShareSnippet(onClose)}
              >
                Share Snippet
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ShareSnippet;
