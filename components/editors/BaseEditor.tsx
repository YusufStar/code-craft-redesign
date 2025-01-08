"use client";
import { memo, useState, useEffect, useRef } from "react";
import { Skeleton } from "@nextui-org/skeleton";
import dynamic from "next/dynamic";
import { Download, Copy, Settings, X, Share, Check } from "lucide-react";
import { Image } from "@nextui-org/image";
import { toast } from "sonner";
import { Monaco } from "@monaco-editor/react";

import TourModal from "../TourModal";

import ShareSnippet from "./ShareSnippet";
import EditorSettings from "./EditorSettings";

import useMounted from "@/hooks/useMounted";
import { fileToLang, languageIcons } from "@/constants/icons";
import useFileStore from "@/store/fileStore";
import { getLanguage } from "@/modules/monaco-editor";
import { updateFileContent } from "@/actions/fileActions";
import useEditorStore from "@/store/editorStore";
import { useMonaco } from "@/modules/load-monaco";

const generateRandomWidth = () => `${Math.floor(Math.random() * 75) + 25}%`;

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-2 p-1">
      {Array.from({ length: 25 }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-3 rounded`}
          style={{ width: generateRandomWidth() }}
        />
      ))}
    </div>
  ),
});

const BaseEditor = memo(() => {
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
    updateContent,
    getFileContent,
    getFiles,
  } = useFileStore();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getFileName = (id: string) => {
    const files = getFiles();
    const file = files.find((file) => file.id === id);

    return file ? file.name : "";
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

      timeoutRef.current = setTimeout(() => {
        updateFileContent(activeFile, value)
          .then(() => {
            updateContent(activeFile, value);
          })
          .catch((error) => {
            console.error("Error updating file content:", error);
          });
      }, 1500);
    }
  };

  useEffect(() => {
    if (activeFile) {
      const content = getFileContent(activeFile);

      if (editorInstance && content !== undefined) {
        editorInstance.setValue(content);
      }
      console.log("Active file content:", content);
    }
  }, [activeFile, getFileContent, editorInstance]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
    // const hasVisited = localStorage.getItem("hasVisited");

    // if (!hasVisited) {
    //   setStartTourModal(true);
    //   localStorage.setItem("hasVisited", "true");
    // } else {
    //   setStartTourModal(false);
    // }
  }, []);

  if (!mounted) return;

  return (
    <div className="h-full flex flex-col">
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
      {openFiles.length > 0 ? (
        <>
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
            </div>
          </div>
          <div className="flex-1">
            {mounted && (
              <MonacoEditor
                key={`editor-base`}
                className={`w-full h-full overflow-hidden`}
                height="100%"
                keepCurrentModel={false}
                language={
                  activeFile
                    ? getLanguage(getFileName(activeFile))
                    : "plaintext"
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
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="border border-gray-700 bg-gray-800/50 rounded-md p-4 text-gray-400">
            Open a file to start editing.
          </div>
        </div>
      )}
    </div>
  );
});

BaseEditor.displayName = "BaseEditor";

export default BaseEditor;
