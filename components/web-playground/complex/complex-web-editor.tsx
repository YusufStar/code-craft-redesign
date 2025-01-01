"use client";
import type { editor } from "monaco-editor";

import { useState, useRef, useEffect } from "react";
import { Image } from "@nextui-org/image";
import { type Monaco } from "@monaco-editor/react";
import { shikiToMonaco } from "@shikijs/monaco";
import { Play, Plus, Settings, Trash, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@nextui-org/skeleton";
import dynamic from "next/dynamic";

import NewFunctionModal from "./new-function-modal";

import { languageIcons } from "@/constants/icons";
import EditorSettings from "@/components/editors/EditorSettings";
import useEditorStore from "@/store/editorStore";
import { BundledLanguage } from "shiki/langs";

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

const ComplexWebEditor = () => {
  const { getEditorSettings } = useEditorStore();
  const [settingsModal, setSettingsModal] = useState(false);
  const [functions, setFunctions] = useState<
    {
      function_name: string;
      function_code: string;
    }[]
  >([
    {
      function_name: "App",
      function_code: `function App() {
    return (
        <div>
            <h1>CodeCraft IDE</h1>
        </div>
    );
}`,
    },
  ]);
  const [iframeKey, setIframeKey] = useState(0);
  const [resultModal, setResultModal] = useState(false);
  const reactEditorRef = useRef<HTMLDivElement>(null);
  const [newFunctionModal, setNewFunctionModal] = useState(false);
  const [editorHeight, setEditorHeight] = useState(600);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(
    functions[0].function_name
  );
  const [editorValue, setEditorValue] = useState(functions[0].function_code);
  const [editorLanguage, setEditorLanguage] = useState<BundledLanguage>("javascript");
  const [cssValue, setCssValue] = useState(`body {
    background-color: #1e1e1e;
    color: #d4d4d4;
}`);

  const monacoRef = useRef<Monaco | null>(null);
  const { highlighter } = useEditorStore();
  const shikiLoaded = useRef(false);

  useEffect(() => {
    if (reactEditorRef.current) {
      setEditorHeight(reactEditorRef.current.clientHeight - 40);
    }
  }, []);

  useEffect(() => {
    const loadShiki = async () => {
      if (monacoRef.current && !shikiLoaded.current && highlighter) {
        shikiToMonaco(highlighter, monacoRef.current);
        shikiLoaded.current = true;
      }
    };

    loadShiki();
  }, [monacoRef.current, shikiLoaded.current, highlighter]);

  const handleSettings = () => {
    setSettingsModal(true);
  };

  const handleAddFunction = () => {
    setNewFunctionModal(true);
  };

  const handleAddFunctionConfirm = (
    functionName: string,
    functionCode: string
  ) => {
    setFunctions([
      ...functions,
      { function_name: functionName, function_code: functionCode },
    ]);
  };

  const handleEditorDidMount = (editor: any) => {
    editor.getModel()?.setEOL(0);

    requestAnimationFrame(() => {
      editor.layout();
      editor.focus();
    });
  };

  const handleFunctionSelect = (funcName: string, funcCode: string) => {
    setSelectedFunction(funcName);
    setEditorValue(funcCode);
    setEditorLanguage("javascript");
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    setEditorValue(value);
    if (selectedFunction) {
      setFunctions((prev) =>
        prev.map((func) =>
          func.function_name === selectedFunction
            ? { ...func, function_code: value }
            : func
        )
      );
    } else if (editorLanguage === "css") {
      setCssValue(value);
    }
  };

  const handleCompileAndRun = () => {
    setIframeKey((prev) => prev + 1);
    setResultModal(true);
  };

  const getFormatedOneFile = () => {
    return functions
      .map((func) => {
        return `
        ${func.function_code}
        `;
      })
      .join("\n");
  };

  const injectCodeToIframe = () => {
    const iframe = document.getElementById(
      "preview-iframe"
    ) as HTMLIFrameElement;

    if (iframe) {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDocument) {
        iframeDocument.open();
        iframeDocument.write(`
          <html>
            <head>
            <style>
            ${cssValue}
            </style>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script> 
            <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
            </head>
            <body>
              <div id="app"></div>
              <script type="text/javascript">
                const { React, ReactDOM } = window;

                if (!React || !ReactDOM) {
                    console.error("React or ReactDOM is not loaded.");
                }
              </script>
               <script type="text/babel" data-presets="react" data-type="module">
               const { React, ReactDOM } = window;

        ${getFormatedOneFile()}
  
        ReactDOM.render(
            <App />,
          document.getElementById("app")
        );
      </script>
            </body>
          </html>
        `);
        iframeDocument.close();
      }
    }
  };

  const handleStyleSelect = () => {
    setSelectedFunction(null);
    setEditorValue(cssValue);
    setEditorLanguage("css");
  };

  return (
    <div className="h-full flex flex-col">
      <EditorSettings open={settingsModal} onOpenChange={setSettingsModal} />
      <NewFunctionModal
        existingFunctionNames={functions.map((func) => func.function_name)}
        open={newFunctionModal}
        onAddFunction={handleAddFunctionConfirm}
        onOpenChange={setNewFunctionModal}
      />

      <div className="flex items-center justify-between px-4 h-10 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Image
              alt={"css"}
              height={16}
              radius="none"
              src={`https://app.requestly.io/delay/100/${languageIcons["react"]}`}
              width={16}
            />
            <span className="text-sm text-gray-400">
              Complex Web Editor (React)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
            title="Compile and Run"
            onClick={handleCompileAndRun}
          >
            <Play className="w-4 h-4 text-gray-400" />
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

      <div className="flex-1 flex gap-4 p-4 relative">
        <AnimatePresence>
          {resultModal && (
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
                    onClick={() => {
                      setResultModal(false);
                    }}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <iframe
                key={iframeKey}
                className="w-full h-full border border-white/20 rounded-b-lg"
                id="preview-iframe"
                sandbox="allow-scripts allow-same-origin"
                title="preview-iframe"
                onLoad={injectCodeToIframe}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left Side bar (Functions) */}
        <div className="w-1/4 h-full border border-white/20 rounded-lg">
          <div className="flex items-center justify-between px-4 h-10 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-gray-400">Components</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                title="Add Function"
                onClick={handleAddFunction}
              >
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="h-full w-full overflow-y-auto">
            <AnimatePresence>
              <motion.div
                key={"style"}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 py-2 border-b border-white/10 cursor-pointer flex items-center justify-between ${
                  editorLanguage === "css" ? "bg-gray-800" : "hover:bg-gray-700"
                }`}
                exit={{ opacity: 0, y: 8 }}
                initial={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                onClick={handleStyleSelect}
              >
                <div className="text-sm text-gray-400">
                  <strong className="text-xs">Style</strong>
                </div>
              </motion.div>
              {functions.map((func, index) => (
                <motion.div
                  key={index}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 py-2 border-b border-white/10 cursor-pointer flex items-center justify-between ${
                    selectedFunction === func.function_name
                      ? "bg-gray-800"
                      : "hover:bg-gray-700"
                  }`}
                  exit={{ opacity: 0, y: 8 }}
                  initial={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() =>
                    handleFunctionSelect(func.function_name, func.function_code)
                  }
                >
                  <div className="text-sm text-gray-400">
                    {func.function_name}
                  </div>

                  {func.function_name !== "App" && (
                    <div className="flex items-center gap-0.5">
                      <button
                        className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                        title="Edit Function"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                        title="Delete Function"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (func.function_name.toLowerCase() === "app")
                            return;

                          if (selectedFunction === func.function_name) {
                            handleFunctionSelect(
                              "App",
                              functions[0].function_code
                            );
                          }

                          setFunctions((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div
          ref={reactEditorRef}
          className={`flex flex-1 flex-col border border-white/20 rounded-lg`}
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
                  src={`https://app.requestly.io/delay/100/${languageIcons["react"]}`}
                  width={16}
                />
                <span className="text-sm text-gray-400">
                  {editorLanguage.toLowerCase() === "css"
                    ? "Css"
                    : selectedFunction}
                </span>
              </div>
            </div>
          </div>
          <MonacoEditor
            height={editorHeight}
            language={editorLanguage}
            options={getEditorSettings()}
            value={editorValue}
            onChange={handleEditorChange}
            onMount={(editor, monaco) => {
              monacoRef.current = monaco;
              handleEditorDidMount(editor);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ComplexWebEditor;
