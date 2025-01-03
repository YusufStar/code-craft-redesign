"use client";

import { Skeleton } from "@nextui-org/skeleton";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  Download,
  Copy,
  Settings,
  X,
  Share,
  Check,
  Trash,
  Play,
} from "lucide-react";
import clsx from "clsx";
import { ScrollShadow, Input, Image } from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Monaco } from "@monaco-editor/react";
import { useSearchParams } from "next/navigation";

import DependencyManager from "./DependencyManager";
import ProjectSelector, { Project } from "./ProjectSelector";

import TourModal from "@/components/TourModal";
import ShareSnippet from "@/components/editors/ShareSnippet";
import EditorSettings from "@/components/editors/EditorSettings";
import useMounted from "@/hooks/useMounted";
import { fileToLang, languageIcons } from "@/constants/icons";
import useReactStore, { File as FileType } from "@/store/reactStore";
import useEditorStore from "@/store/editorStore";
import { useMonaco } from "@/modules/load-monaco";
import { getLanguage } from "@/modules/monaco-editor";
import { FolderType } from "@/store/fileStore";
import { axiosInstance } from "@/hooks/useAxios";
import {
  deleteFile,
  updateFile,
  updateFileContent,
  updateFolder,
} from "@/actions/reactActions";

const generateRandomWidth = () => `${Math.floor(Math.random() * 75) + 25}%`;

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-2 p-1">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-3 rounded`}
          style={{ width: generateRandomWidth() }}
        />
      ))}
    </div>
  ),
});

type ItemType = FileType | FolderType;

const sortChildren = (children: any): any[] => {
  if (!children) return [];

  const childrenArray = Object.values(children);
  const folders = childrenArray.filter((item: any) => item.type === "folder");
  const files = childrenArray.filter((item: any) => item.type !== "folder");

  folders.sort((a: any, b: any) => a.name.localeCompare(b.name));
  files.sort((a: any, b: any) => a.name.localeCompare(b.name));

  return [...folders, ...files].map((child: any) => ({
    ...child,
    children: sortChildren(child.children),
  }));
};

const FileTreeItem = ({
  item,
  depth = 0,
  selectedFile,
  onSelectFile,
  fetchData,
  projects,
}: {
  item: ItemType;
  depth?: number;
  selectedFile?: string;
  onSelectFile: (path: string) => void;
  fetchData: () => void;
  projects: Project[];
}) => {
  const { openFolders, toggleFolder, folderStructure } = useReactStore();
  const isFolder = item.type === "folder";
  const path = isFolder ? item.id : item.id;
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(item.name || "");
  const isOpen = !!openFolders[path as string];
  const params = useSearchParams();
  const projectId = params.get("projectId");

  const handleClick = () => {
    if (isFolder) {
      toggleFolder(path as string);
    } else {
      onSelectFile(path as string);
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
      if (newName.trim() === "") {
        return;
      }

      if (newName === item.name) {
        setIsEditing(false);

        return;
      }

      if (!projectId) {
        return;
      }

      // find item in folderstructure for the given path
      const findFile = (
        structure: any,
        targetId: string
      ): { path: string; name: string } | undefined => {
        if (!structure) return undefined;

        for (const key in structure) {
          const item = structure[key];

          if (item.id === targetId) {
            return { path: item.id, name: item.name };
          }
          if (item.children) {
            const found = findFile(item.children, targetId);

            if (found) {
              return found;
            }
          }
        }

        return undefined;
      };

      if (!item.id) return;
      const file = findFile(folderStructure, item.id);

      if (file && file.path.split("/").length > 2) {
        if (isFolder) {
          await updateFolder(
            projectId,
            file.path,
            file.path.replace(item.name ? item.name : "", newName)
          );
        } else {
          await updateFile(
            projectId,
            file.path,
            file.path.replace(item.name ? item.name : "", newName)
          );
        }
        await fetchData();
      } else if (file) {
        toast.error("Root folder cannot be renamed");
      }

      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleDeleteFile = async () => {
    if (!projectId || !item.id) return;
    await deleteFile(projectId, item.id);
    await fetchData();
  };

  return (
    <div>
      <div
        className={clsx(
          "flex items-center py-1 px-2 hover:bg-black/20 rounded-sm transition-all duration-200 cursor-pointer text-sm",
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
          ) : item.name?.split(".").pop() &&
            languageIcons[
              fileToLang[item.name?.split(".").pop() as keyof typeof fileToLang]
            ] ? (
            <Image
              alt="Logo"
              height={16}
              radius="none"
              src={`https://app.requestly.io/delay/25/${
                languageIcons[
                  fileToLang[
                    item.name?.split(".").pop() as keyof typeof fileToLang
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
              className="text-gray-300 px-1 focus:outline-none rounded border w-3/4 border-gray-500 bg-gray-700/50"
              type="text"
              value={newName}
              onBlur={handleBlur}
              onChange={handleNameChange}
              onKeyDown={handleNameSubmit}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          ) : (
            <>
              <span className="text-gray-300">{item.name}</span>
              {item.type === "file" && (
                <button
                  aria-label="Remove Dependency"
                  className="p-1 ml-auto rounded transition-all duration-150 ease-in-out bg-black hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDeleteFile();
                  }}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isFolder && isOpen && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {item.children &&
              sortChildren(item.children).map((child: any) => (
                <FileTreeItem
                  key={child.id}
                  depth={depth + 1}
                  fetchData={fetchData}
                  item={child}
                  projects={projects}
                  selectedFile={selectedFile}
                  onSelectFile={onSelectFile}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FileManagerTab = ({
  projectId,
  projects,
}: {
  projectId: string;
  projects: Project[];
}) => {
  const [selectedFile, setSelectedFile] = useState<string>();
  const { folderStructure, addOpenFile, setFolderStructure } = useReactStore();
  const [loading, setLoading] = useState(false);
  const [showCreateRootFolder, setShowCreateRootFolder] = useState(false);
  const [rootFolderName, setRootFolderName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!projectId) {
        return;
      }
      const { data } = await axiosInstance.get(`/react/${projectId}/files`);
      const folders = data.filter((item: any) => item.type === "folder");
      const files = data.filter((item: any) => item.type !== "folder");

      folders.sort((a: any, b: any) => a.name.localeCompare(b.name));
      files.sort((a: any, b: any) => a.name.localeCompare(b.name));

      const sortedData = [...folders, ...files];

      setFolderStructure(sortedData);
      setShowCreateRootFolder(data.length === 0);
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
  };

  const generateRandomWidth = () => `${Math.floor(Math.random() * 75) + 25}%`;

  return (
    <div className="relative h-full">
      <div className="relative h-full bg-[#0d0d12] rounded-xl p-2 ring-1 ring-gray-800/50 overflow-hidden">
        <ScrollShadow className="h-full">
          {loading ? (
            <div className="flex flex-col gap-2 p-1">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={`h-3 rounded`}
                  style={{ width: generateRandomWidth() }}
                />
              ))}
            </div>
          ) : showCreateRootFolder ? (
            <div className="flex  h-full gap-2">
              <Input
                className="w-full"
                placeholder="Enter root folder name"
                size="sm"
                type="text"
                value={rootFolderName}
                onChange={(e) => setRootFolderName(e.target.value)}
              />
            </div>
          ) : (
            folderStructure &&
            Object.values(folderStructure).map((folder: any) => (
              <FileTreeItem
                key={folder.id}
                fetchData={fetchData}
                item={folder}
                projects={projects}
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

const BaseEditor = ({ projectId }: { projectId: string }) => {
  const { generateMonaco, loadDefaultTypes } = useMonaco();
  const [startTourModal, setStartTourModal] = useState(true);

  const { getEditorSettings } = useEditorStore();
  const mounted = useMounted();
  const [copied, setCopied] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [settingsModal, setSettingsModal] = useState(false);
  const monacoRef = useRef<Monaco | null>(null);
  const [shareSnippetModal, setShareSnippetModal] = useState(false);
  const {
    openFiles,
    removeOpenFile,
    activeFile,
    setActiveFile,
    getFileContent,
    getFiles,
  } = useReactStore();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // path example = /7e96ede9-7095-4a78-b7e5-e001a2e52a59/test/src/logo.svg
  const getFileName = (path: string) => {
    const files = getFiles();
    const file = files.find((file) => file.filename === path);

    return file ? file.name || "" : "";
  };

  const handleDownload = () => {
    if (!editorInstance) return;
    const content = editorInstance.getValue();
    const blob = new Blob([content], { type: "text/javascript" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "main.js";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("File downloaded successfully.");
  };

  const handleCopy = () => {
    if (!editorInstance) return;
    const content = editorInstance.getValue();

    setCopied(true);
    navigator.clipboard.writeText(content);
    toast.success("Code copied to clipboard.");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleSettings = () => {
    setSettingsModal(true);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (typeof value === "string" && activeFile) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        await updateFileContent(projectId, activeFile, value);
      }, 1500);
    }
  };

  const handleDevServer = async () => {
    try {
      if (!projectId) {
        toast.error("Proje ID'si bulunamadı.");
        return;
      }
      const response = await axiosInstance.post(`/react/${projectId}/run`);

      if (response.status === 200) {
        toast.success(response.data.message);
      } else {
        toast.error("Geliştirme sunucusu başlatılamadı.");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Geliştirme sunucusu başlatılırken bir hata oluştu."
      );
    }
  };

  useEffect(() => {
    if (activeFile) {
      const content = getFileContent(activeFile);

      if (editorInstance && content !== undefined) {
        editorInstance.setValue(content);
      }
    }
  }, [activeFile, getFileContent, editorInstance]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (openFiles.length > 0) {
      setActiveFile(openFiles[openFiles.length - 1]);
    }
  }, [openFiles]);

  const handleEditorDidMount = (editor: any) => {
    setEditorInstance(editor);
    editor.getModel()?.setEOL(0);

    requestAnimationFrame(() => {
      editor.layout();
      editor.focus();
    });
  };

  const handleFileTabClick = (file: string) => {
    setActiveFile(file);
  };

  const handleCloseFile = (e: React.MouseEvent, file: string) => {
    e.stopPropagation();
    removeOpenFile(file);
  };

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");

    if (!hasVisited) {
      setStartTourModal(true);
      localStorage.setItem("hasVisited", "true");
    } else {
      setStartTourModal(false);
    }
  }, []);

  if (!mounted) return;

  return (
    <div className="h-full flex flex-col py-2 rounded-lg">
      <EditorSettings open={settingsModal} onOpenChange={setSettingsModal} />
      <ShareSnippet
        open={shareSnippetModal}
        onOpenChange={setShareSnippetModal}
      />
      <TourModal open={startTourModal} onOpenChange={setStartTourModal} />

      <div className="flex h-9 items-center border-b border-white/10 overflow-x-auto">
        <div className="flex flex-nowrap whitespace-nowrap">
          {openFiles.length > 0 &&
            openFiles.map((file) => (
              <div
                key={file}
                className={`file-header  items-center flex gap-2 px-2.5 py-[0.38rem] first:rounded-tl-md text-sm text-gray-400 border-b-2 hover:bg-gray-700 transition-colors ${
                  activeFile === file
                    ? "border-blue-500 text-white"
                    : "border-transparent"
                }`}
              >
                <button onClick={() => handleFileTabClick(file)}>
                  {getFileName(file)}
                </button>
                <button
                  className="p-0.5 hover:bg-gray-900/50 rounded-md transition-colors"
                  onClick={(e) => handleCloseFile(e, file)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 h-10 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          {activeFile && (
            <div className="flex items-center gap-2 ml-4">
              <Image
                alt={activeFile}
                height={16}
                radius="none"
                src={`https://app.requestly.io/delay/100/${
                  languageIcons[
                    fileToLang[
                      getFileName(activeFile)
                        .split(".")
                        .pop() as keyof typeof fileToLang
                    ]
                  ]
                }`}
                width={16}
              />
              <span className="ext-sm text-gray-400">
                {getFileName(activeFile)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            title="Share Snippet"
            onClick={() => setShareSnippetModal(true)}
          >
            <Share className="w-4 h-4 text-gray-400" />
          </button>

          <button
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            title="Download File"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            disabled={copied}
            title="Copy Code"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-4 h-4 text-gray-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            title="Editor Settings"
            onClick={handleSettings}
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            title="Editor Settings"
            onClick={handleDevServer}
          >
            <Play className="w-4 h-4 text-green-500" />
          </button>
        </div>
      </div>
      <div className="flex-1">
        <MonacoEditor
          key={`editor-react`}
          className={`w-full h-full overflow-hidden`}
          height="100%"
          keepCurrentModel={false}
          language={
            activeFile ? getLanguage(getFileName(activeFile)) : "plaintext"
          }
          options={getEditorSettings()}
          onChange={handleEditorChange}
          onMount={(editor, monaco) => {
            monacoRef.current = monaco;
            handleEditorDidMount(editor);
            generateMonaco(monaco);
            loadDefaultTypes(monaco);
          }}
        />
      </div>
    </div>
  );
};

const ComplexWebEditor = () => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const params = useSearchParams();

  useEffect(() => {
    const id = params.get("projectId");

    if (id) {
      setProjectId(id);
    }
  }, [params]);

  if (!projectId) {
    return <ProjectSelector projects={projects} setProjects={setProjects} />;
  }

  return (
    <div className="h-full flex">
      <div className="w-1/6 border-r border-white/10 p-2">
        <FileManagerTab projectId={projectId} projects={projects} />
      </div>
      <div className="flex-1">
        <BaseEditor projectId={projectId} />
      </div>
      <div className="w-1/6 border-l border-white/10 p-2">
        <DependencyManager projectId={projectId} />
      </div>
    </div>
  );
};

export default ComplexWebEditor;
