"use client";
import { useState, useRef, useEffect } from "react";
import { Image } from "@nextui-org/image";
import { Download, Fullscreen, Settings } from "lucide-react";
import { EditorProps, type Monaco } from "@monaco-editor/react";
import { AnimatePresence, motion } from "framer-motion";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { shikiToMonaco } from "@shikijs/monaco";
import { getHighlighter } from "shiki/bundle/web";
import { editor } from "monaco-editor";
import { Skeleton } from "@nextui-org/skeleton";
import dynamic from "next/dynamic";

import { languageIcons } from "@/constants/icons";
import EditorSettings from "@/components/editors/EditorSettings";

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

const editorOptions: EditorProps["options"] = {
  automaticLayout: true,
  fontSize: 14,
  minimap: { enabled: false },
  padding: { top: 12, bottom: 12 },
  scrollBeyondLastLine: false,
  scrollbar: { vertical: "hidden", horizontal: "hidden" },
  wordWrap: "on",
  folding: true,
  lineNumbers: "on" as editor.LineNumbersType,
  roundedSelection: false,
  renderWhitespace: "none",
  renderLineHighlight: "line",
  autoClosingBrackets: "always",
  autoClosingOvertype: "always",
  autoClosingQuotes: "always",
  autoIndent: "full",
  autoClosingComments: "always",
  autoClosingDelete: "always",
  cursorBlinking: "solid",
  quickSuggestions: true,
  acceptSuggestionOnEnter: "off",
  contextmenu: false,
  occurrencesHighlight: "multiFile",
  selectionHighlight: true,
  codeLens: false,
  renderControlCharacters: true,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: true,
  overviewRulerLanes: 0,
  formatOnPaste: true,
  formatOnType: false,
};

const BasicWebEditor = () => {
  const [settingsModal, setSettingsModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const htmlEditorRef = useRef<HTMLDivElement>(null);
  const jsEditorRef = useRef<HTMLDivElement>(null);
  const cssEditorRef = useRef<HTMLDivElement>(null);
  const [htmlEditorHeight, setHtmlEditorHeight] = useState(0);
  const [jsEditorHeight, setJsEditorHeight] = useState(0);
  const [cssEditorHeight, setCssEditorHeight] = useState(0);
  const htmlMonacoRef = useRef<any>(null);
  const jsMonacoRef = useRef<any>(null);
  const cssMonacoRef = useRef<any>(null);
  const [formattedIframe, setFormattedIframe] = useState("");
  const monacoRef = useRef<Monaco | null>(null);

  const handleSettings = () => {
    setSettingsModal(true);
  };

  const handleDownload = async () => {
    const zip = new JSZip();

    zip.file("index.html", htmlMonacoRef.current?.getValue() || "");
    zip.file("style.css", cssMonacoRef.current?.getValue() || "");
    zip.file("script.js", jsMonacoRef.current?.getValue() || "");

    const content = await zip.generateAsync({ type: "blob" });

    saveAs(content, "web-editor-project.zip");
  };

  const handleEditorDidMount = (editor: any) => {
    editor.getModel()?.setEOL(0);

    requestAnimationFrame(() => {
      editor.layout();
      editor.focus();
    });
  };

  useEffect(() => {
    const calculateHeights = () => {
      if (htmlEditorRef.current) {
        setHtmlEditorHeight(htmlEditorRef.current.offsetHeight - 40);
      }
      if (jsEditorRef.current) {
        setJsEditorHeight(jsEditorRef.current.offsetHeight - 40);
      }
      if (cssEditorRef.current) {
        setCssEditorHeight(cssEditorRef.current.offsetHeight - 40);
      }
    };

    calculateHeights();
    window.addEventListener("resize", calculateHeights);

    return () => {
      window.removeEventListener("resize", calculateHeights);
    };
  }, []);

  useEffect(() => {
    if (htmlMonacoRef.current && jsMonacoRef.current && cssMonacoRef.current) {
      const updateIframe = () => {
        setFormattedIframe(`
          <html>
            <head>
              <style>
                ${cssMonacoRef.current?.getValue() || ""}
              </style>
            </head>
            <body>
              ${htmlMonacoRef.current?.getValue() || ""}
              <script>
                ${jsMonacoRef.current?.getValue() || ""}
              </script>
            </body>
          </html>
        `);
      };

      htmlMonacoRef.current.onDidChangeModelContent(updateIframe);
      jsMonacoRef.current.onDidChangeModelContent(updateIframe);
      cssMonacoRef.current.onDidChangeModelContent(updateIframe);

      updateIframe();
    }
  }, [htmlMonacoRef, jsMonacoRef, cssMonacoRef]);

  const toggleFullScreen = () => {
    setIsFullScreen((prevState) => !prevState);
  };

  return (
    <div className="h-full flex flex-col">
      <EditorSettings open={settingsModal} onOpenChange={setSettingsModal} />

      <div className="flex items-center justify-between px-4 h-10 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Image
              alt={"javascript"}
              height={16}
              radius="none"
              src={`https://app.requestly.io/delay/100/${languageIcons["javascript"]}`}
              width={16}
            />
            <Image
              alt={"html"}
              height={16}
              radius="none"
              src={`https://app.requestly.io/delay/100/${languageIcons["html"]}`}
              width={16}
            />
            <Image
              alt={"css"}
              height={16}
              radius="none"
              src={`https://app.requestly.io/delay/100/${languageIcons["css"]}`}
              width={16}
            />
            <span className="text-sm text-gray-400">Basic Web Editor</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            title="Download File"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 text-gray-400" />
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

      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4 relative">
        {/* Full Screen Overlay */}
        <AnimatePresence>
          {isFullScreen && (
            <motion.div
              key={"fullscreen-overlay"}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex flex-col w-[calc(100%-2rem)] h-[calc(100%-2rem)] z-20 border border-white/20 rounded-lg transition-all absolute bg-black top-4 left-4`}
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-between px-4 h-10 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  </div>

                  <span className="text-sm text-gray-400">Preview</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                    title="Full Screen"
                    onClick={toggleFullScreen}
                  >
                    <Fullscreen className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              {formattedIframe ? (
                <iframe
                  className="w-full h-full border border-white/20 rounded-b-lg"
                  sandbox="allow-scripts"
                  srcDoc={formattedIframe}
                  title="preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <span className="text-lg animate-pulse">Preview</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HTML Editor */}
        <div
          ref={htmlEditorRef}
          className={`flex flex-col border border-white/20 rounded-lg`}
        >
          <div className="flex items-center justify-between px-4 h-10 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Image
                  alt={"html"}
                  height={16}
                  radius="none"
                  src={`https://app.requestly.io/delay/100/${languageIcons["html"]}`}
                  width={16}
                />
                <span className="text-sm text-gray-400">Html</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                title="Download File"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <MonacoEditor
            height={htmlEditorHeight}
            language="html"
            options={editorOptions}
            theme="dark-plus"
            onMount={(editor, monaco) => {
              htmlMonacoRef.current = editor;
              monacoRef.current = monaco;
              handleEditorDidMount(editor);
              void (async () => {
                const highlighter = await getHighlighter({
                  themes: ["dark-plus"],
                  langs: ["html"],
                });

                shikiToMonaco(highlighter, monacoRef.current);
              })();
              editor.onDidChangeModelContent(() => {
                setFormattedIframe(`
                  <html>
                    <head>
                      <style>
                        ${cssMonacoRef.current?.getValue() || ""}
                      </style>
                    </head>
                    <body>
                      ${htmlMonacoRef.current?.getValue() || ""}
                      <script>
                        ${jsMonacoRef.current?.getValue() || ""}
                      </script>
                    </body>
                  </html>
                `);
              });
            }}
          />
        </div>

        {/* JavaScript Editor */}
        <div
          ref={jsEditorRef}
          className={`flex flex-col border border-white/20 rounded-lg`}
        >
          <div className="flex items-center justify-between px-4 h-10 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Image
                  alt={"javascript"}
                  height={16}
                  radius="none"
                  src={`https://app.requestly.io/delay/100/${languageIcons["javascript"]}`}
                  width={16}
                />
                <span className="text-sm text-gray-400">Javascript</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                title="Download File"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <MonacoEditor
            height={jsEditorHeight}
            language="javascript"
            options={editorOptions}
            theme="dark-plus"
            onMount={(editor, monaco) => {
              jsMonacoRef.current = editor;
              monacoRef.current = monaco;
              handleEditorDidMount(editor);
              void (async () => {
                const highlighter = await getHighlighter({
                  themes: ["dark-plus"],
                  langs: ["javascript"],
                });

                shikiToMonaco(highlighter, monacoRef.current);
              })();
              editor.onDidChangeModelContent(() => {
                setFormattedIframe(`
                  <html>
                    <head>
                      <style>
                        ${cssMonacoRef.current?.getValue() || ""}
                      </style>
                    </head>
                    <body>
                      ${htmlMonacoRef.current?.getValue() || ""}
                      <script>
                        ${jsMonacoRef.current?.getValue() || ""}
                      </script>
                    </body>
                  </html>
                `);
              });
            }}
          />
        </div>

        {/* CSS Editor */}
        <div
          ref={cssEditorRef}
          className={`flex flex-col border border-white/20 rounded-lg`}
        >
          <div className="flex items-center justify-between px-4 h-10 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Image
                  alt={"css"}
                  height={16}
                  radius="none"
                  src={`https://app.requestly.io/delay/100/${languageIcons["css"]}`}
                  width={16}
                />
                <span className="text-sm text-gray-400">Css</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                title="Download File"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <MonacoEditor
            height={cssEditorHeight}
            language="css"
            options={editorOptions}
            theme="dark-plus"
            onMount={(editor, monaco) => {
              cssMonacoRef.current = editor;
              monacoRef.current = monaco;
              handleEditorDidMount(editor);
              void (async () => {
                const highlighter = await getHighlighter({
                  themes: ["dark-plus"],
                  langs: ["css"],
                });

                shikiToMonaco(highlighter, monacoRef.current);
              })();
              editor.onDidChangeModelContent(() => {
                setFormattedIframe(`
                  <html>
                    <head>
                      <style>
                        ${cssMonacoRef.current?.getValue() || ""}
                      </style>
                    </head>
                    <body>
                      ${htmlMonacoRef.current?.getValue() || ""}
                      <script>
                        ${jsMonacoRef.current?.getValue() || ""}
                      </script>
                    </body>
                  </html>
                `);
              });
            }}
          />
        </div>

        {/* Preview */}
        <div
          className={`flex flex-col border border-white/20 rounded-lg transition-all 10 bg-black`}
        >
          <div className="flex items-center justify-between px-4 h-10 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>

              <span className="text-sm text-gray-400">Preview</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                title="Full Screen"
                onClick={toggleFullScreen}
              >
                <Fullscreen className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          {formattedIframe ? (
            <iframe
              className="w-full h-full border border-white/20 rounded-b-lg"
              sandbox="allow-scripts"
              srcDoc={formattedIframe}
              title="preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span className="text-lg animate-pulse">Preview</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicWebEditor;
