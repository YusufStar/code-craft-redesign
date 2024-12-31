"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
  Input,
} from "@nextui-org/react";
import { ChevronDownIcon, SearchIcon } from "lucide-react";
import { useState, useMemo } from "react";

export interface FileType {
  id: string;
  name: string;
  type: "file";
  content: string;
}

interface MultiFileSelectProps {
  files: FileType[];
  onFileSelect: (files: FileType[]) => void;
}

const MultiFileSelect = ({ files, onFileSelect }: MultiFileSelectProps) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [searchQuery, setSearchQuery] = useState("");

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    return files.filter((file: FileType) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Generate display value for the button
  const selectedValue = useMemo(() => {
    const selected = Array.from(selectedKeys);

    if (selected.length === 0) return "Select file";
    // if selected files name all total files name < 60 then show all selected files name
    if (selected.join(", ").length < 55) return selected.join(", ");

    return `${selected.length} files selected`;
  }, [selectedKeys]);

  // Handle selection changes
  const handleSelectionChange = (keys: Set<React.Key>) => {
    // @ts-ignore
    if (keys === "all") return;

    const selectedFileNames = new Set(
      Array.from(keys).map((key) => String(key))
    );

    // If no files are selected, clear the selection state
    if (selectedFileNames.size === 0) {
      setSelectedKeys(new Set());
      onFileSelect([]);

      return;
    }

    // Update selected keys state
    setSelectedKeys(selectedFileNames);

    // Get the selected files based on the selected file names
    const selectedFiles = files.filter((file) =>
      selectedFileNames.has(file.name)
    );

    onFileSelect(selectedFiles);
  };

  // Prevent selecting all files with Ctrl + A
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "a") {
      e.preventDefault(); // Prevent default "select all" behavior
    }
  };

  return (
    <Dropdown>
      <DropdownTrigger className="w-full">
        <Button
          className="w-full text-left justify-start"
          endContent={<ChevronDownIcon className="text-small ml-auto" />}
          variant="faded"
        >
          {selectedValue}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Multi-file selection with search"
        className="w-full"
        closeOnSelect={false}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        variant="flat"
        onKeyDown={handleKeyDown} // Add the onKeyDown event handler here
        onSelectionChange={(keys) =>
          handleSelectionChange(keys as Set<React.Key>)
        }
      >
        <DropdownSection>
          <DropdownItem key="search" isReadOnly variant="light">
            <Input
              fullWidth
              placeholder="Search files..."
              startContent={<SearchIcon />}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </DropdownItem>
        </DropdownSection>
        <DropdownSection>
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <DropdownItem key={file.name}>
                <div className="flex flex-col">
                  <span className="text-small font-medium">{file.name}</span>
                  <span className="text-tiny text-default-400">
                    {file.content.slice(0, 20) +
                      (file.content.length > 20 ? "..." : "")}
                  </span>
                </div>
              </DropdownItem>
            ))
          ) : (
            <DropdownItem key="no-files" isReadOnly>
              <span className="text-small text-default-400">
                No files found
              </span>
            </DropdownItem>
          )}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export default MultiFileSelect;
