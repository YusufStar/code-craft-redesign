"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  Plus,
  FolderPlus,
  FilePlus,
  Trash,
} from "lucide-react";
import clsx from "clsx";
import { ScrollShadow, Button, Input } from "@nextui-org/react";
import { Image } from "@nextui-org/image";
import { motion, AnimatePresence } from "framer-motion";

import { fileToLang, languageIcons } from "@/constants/icons";
import useFileStore, { FileType, FolderType } from "@/store/fileStore";
import {
  fetchFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  createFile,
  updateFile,
  deleteFile,
} from "@/actions/fileActions";

type ItemType = FileType | FolderType;

const FileTreeItem = ({
  item,
  depth = 0,
  selectedFile,
  onSelectFile,
  fetchData,
}: {
  item: ItemType;
  depth?: number;
  selectedFile?: string;
  onSelectFile: (path: string) => void;
  fetchData: () => void;
}) => {
  const { openFolders, toggleFolder, removeOpenFile } = useFileStore();
  const isFolder = item.type === "folder";
  const path = isFolder ? item.id : item.id;
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [isHovered, setIsHovered] = useState(false);
  const isOpen = !!openFolders[path];
  const [addingFile, setAddingFile] = useState(false);
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const handleClick = () => {
    if (isFolder) {
      toggleFolder(path);
    } else {
      onSelectFile(path);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleNameSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (isFolder) {
        await updateFolder(path, newName);
      } else {
        await updateFile(path, newName, "");
      }

      await fetchData();
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleAddFile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAddingFile(true);
    if (isFolder && !isOpen) {
      toggleFolder(path);
    }
  };

  const handleAddFolder = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAddingFolder(true);
    if (isFolder && !isOpen) {
      toggleFolder(path);
    }
  };

  const handleNewFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFileName(e.target.value);
  };

  const handleNewFolderNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewFolderName(e.target.value);
  };

  const handleNewFileNameSubmit = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      let sanitizedFileName = newFileName
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-.]/g, "")
        .replace(/(\.){2,}/g, ".")
        .replace(/^\./, "")
        .replace(/\.$/, "");

      if (!sanitizedFileName.includes(".")) {
        sanitizedFileName += ".txt";
      }

      await createFile(sanitizedFileName, path);
      await fetchData();
      setAddingFile(false);
      setNewFileName("");
    }
  };

  const handleNewFolderNameSubmit = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      const sanitizedFolderName = newFolderName
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-]/g, "");

      await createFolder(sanitizedFolderName, path);
      await fetchData();
      setAddingFolder(false);
      setNewFolderName("");
    }
  };

  const handleNewFileBlur = () => {
    setAddingFile(false);
    setNewFileName("");
  };

  const handleNewFolderBlur = () => {
    setAddingFolder(false);
    setNewFolderName("");
  };

  const handleDeleteFolder = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      await deleteFolder(path);
      await fetchData();
    }
  };

  const handleDeleteFile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      await deleteFile(path);
      removeOpenFile(path);
      await fetchData();
    }
  };

  return (
    <div>
      <div
        className={clsx(
          "flex items-center py-1 px-2 hover:bg-black/50 rounded-sm transition-all duration-200 cursor-pointer text-sm",
          selectedFile === path && "bg-gray-950"
        )}
        role="button"
        style={{ paddingLeft: `${depth * 24}px` }}
        tabIndex={0}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center py-0.5 px-2 gap-1.5 grow">
          {isFolder ? (
            <>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
              <Folder className="h-4 w-4 text-gray-400" />
            </>
          ) : item.name.split(".").pop() &&
            languageIcons[
              fileToLang[item.name.split(".").pop() as keyof typeof fileToLang]
            ] ? (
            <Image
              alt="Logo"
              height={16}
              radius="none"
              src={`https://app.requestly.io/delay/25/${
                languageIcons[
                  fileToLang[
                    item.name.split(".").pop() as keyof typeof fileToLang
                  ]
                ]
              }`}
              width={16}
            />
          ) : (
            <File className="h-4 w-4 text-gray-400" />
          )}
          {isEditing ? (
            <input
              className="text-gray-300 px-1 focus:outline-none rounded border border-gray-500 bg-gray-700/50"
              type="text"
              value={newName}
              onBlur={handleBlur}
              onChange={handleNameChange}
              onKeyDown={handleNameSubmit}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          ) : (
            <span className="text-gray-300">{item.name}</span>
          )}
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1"
              exit={{ opacity: 0, x: -10 }}
              initial={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {!isFolder && (
                <button
                  aria-label="Delete File"
                  className="p-1 rounded transition-all duration-150 ease-in-out bg-black hover:bg-white/10"
                  onClick={handleDeleteFile}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </button>
              )}
              {isFolder && (
                <>
                  <button
                    aria-label="Add File"
                    className="p-1 rounded transition-all duration-150 ease-in-out bg-black hover:bg-white/10"
                    onClick={handleAddFile}
                  >
                    <FilePlus className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Add Folder"
                    className="p-1 rounded transition-all duration-150 ease-in-out bg-black hover:bg-white/10"
                    onClick={handleAddFolder}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Delete Folder"
                    className="p-1 rounded transition-all duration-150 ease-in-out bg-black hover:bg-white/10"
                    onClick={handleDeleteFolder}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isFolder && isOpen && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {(item as FolderType).children.map((child) => (
              <FileTreeItem
                key={child.id}
                depth={depth + 1}
                fetchData={fetchData}
                item={child}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
              />
            ))}
            {(item as FolderType).files.map((child) => (
              <FileTreeItem
                key={child.id}
                depth={depth + 1}
                fetchData={fetchData}
                item={child}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
              />
            ))}
            {addingFile && (
              <div
                className="flex items-center py-1 px-2 hover:bg-black/50 rounded-sm transition-all duration-200 cursor-pointer text-sm"
                style={{ paddingLeft: `${(depth + 1) * 24}px` }}
              >
                <div className="flex items-center py-0.5 px-2 gap-1.5 grow">
                  <File className="h-4 w-4 text-gray-400" />
                  <input
                    className="text-gray-300 px-1 focus:outline-none rounded border border-gray-500 bg-gray-700/50"
                    type="text"
                    value={newFileName}
                    onChange={handleNewFileNameChange}
                    onKeyDown={handleNewFileNameSubmit}
                    onBlur={handleNewFileBlur}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                  />
                </div>
              </div>
            )}
            {addingFolder && (
              <div
                className="flex items-center py-1 px-2 hover:bg-black/50 rounded-sm transition-all duration-200 cursor-pointer text-sm"
                style={{ paddingLeft: `${(depth + 1) * 24}px` }}
              >
                <div className="flex items-center py-0.5 px-2 gap-1.5 grow">
                  <Folder className="h-4 w-4 text-gray-400" />
                  <input
                    className="text-gray-300 px-1 focus:outline-none rounded border border-gray-500 bg-gray-700/50"
                    type="text"
                    value={newFolderName}
                    onChange={handleNewFolderNameChange}
                    onKeyDown={handleNewFolderNameSubmit}
                    onBlur={handleNewFolderBlur}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FileManagerTab = () => {
  const [selectedFile, setSelectedFile] = useState<string>();
  const { folderStructure, addOpenFile, setFolderStructure } = useFileStore();
  const [loading, setLoading] = useState(false);
  const [showCreateRootFolder, setShowCreateRootFolder] = useState(false);
  const [rootFolderName, setRootFolderName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const folders = await fetchFolders();

      setFolderStructure(folders);
      setShowCreateRootFolder(folders.length === 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectFile = (path: string) => {
    setSelectedFile(path);
    addOpenFile(path);
    console.log("Selected file:", path);
  };

  const handleCreateRootFolder = async () => {
    if (rootFolderName) {
      setLoading(true);
      try {
        const newFolder = (await createFolder(rootFolderName)) as FolderType;

        setFolderStructure([newFolder]);
        setShowCreateRootFolder(false);
        setRootFolderName("");
      } catch (error) {
        console.error("Error creating root folder:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative h-full">
      <div className="relative h-full bg-[#0d0d12] rounded-xl p-2 ring-1 ring-gray-800/50 overflow-hidden">
        <ScrollShadow className="h-full">
          {loading ? (
            <div className="text-gray-300 text-center py-4">Loading...</div>
          ) : showCreateRootFolder ? (
            <div className="flex items-center justify-center h-full gap-2">
              <Input
                className="w-2/3"
                placeholder="Enter root folder name"
                size="sm"
                type="text"
                value={rootFolderName}
                onChange={(e) => setRootFolderName(e.target.value)}
              />
              <Button
                isIconOnly
                color="primary"
                isDisabled={!rootFolderName}
                size="sm"
                startContent={<Plus />}
                variant="bordered"
                onClick={handleCreateRootFolder}
              />
            </div>
          ) : (
            folderStructure.map((folder) => (
              <FileTreeItem
                key={folder.id}
                fetchData={fetchData}
                item={folder}
                selectedFile={selectedFile}
                onSelectFile={handleSelectFile}
              />
            ))
          )}
        </ScrollShadow>
      </div>
    </div>
  );
};

export default FileManagerTab;
