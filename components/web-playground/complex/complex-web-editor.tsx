"use client";
import { useState, useRef, useEffect } from "react";
import { Image } from "@nextui-org/image";
import { type Monaco } from "@monaco-editor/react";
import { ChevronUp, Info, Play, Plus, Settings, Trash, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@nextui-org/skeleton";
import dynamic from "next/dynamic";
import { BundledLanguage } from "shiki/langs";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";

import NewFunctionModal from "./new-function-modal";
import UnpkgModal, { Package } from "./unpkg-modal";

import { languageIcons } from "@/constants/icons";
import EditorSettings from "@/components/editors/EditorSettings";
import useEditorStore from "@/store/editorStore";
import { useMonaco } from "@/modules/load-monaco";

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
  const { generateMonaco } = useMonaco();
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
  const [editorLanguage, setEditorLanguage] = useState<BundledLanguage>("tsx");
  const [cssValue, setCssValue] = useState(`body {
    background-color: #1e1e1e;
    color: #d4d4d4;
}`);

  const [packages, setPackages] = useState<Package[]>([]);
  const [unpkgModal, setUnpkgModal] = useState(false);
  const [pkgDetailModal, setPkgDetailModal] = useState(false);
  const [pkgDetail, setPkgDetail] = useState<Package | null>(null);

  const monacoRef = useRef<Monaco | null>(null);
  const [loadedTypeDefinitions, setLoadedTypeDefinitions] = useState<
    Record<string, boolean>
  >({});
  const [monacoKey, setMonacoKey] = useState(0);

  useEffect(() => {
    if (reactEditorRef.current) {
      setEditorHeight(reactEditorRef.current.clientHeight - 40);
    }
  }, []);

  useEffect(() => {
    const loadTypeDefinitions = async () => {
      if (!monacoRef.current) return;

      for (const pkg of packages) {
        if (loadedTypeDefinitions[pkg.name]) continue;
        try {
          const response = await fetch(
            `https://unpkg.com/@types/${pkg.name
              .replace("@", "")
              .replace("/", "__")}/index.d.ts`
          );

          if (!response.ok) {
            continue;
          }
          const typescriptDefinition = await response.text();

          monacoRef.current.languages.typescript.typescriptDefaults.addExtraLib(
            typescriptDefinition,
            `file:///node_modules/@types/${pkg.name}/index.d.ts`
          );
          setLoadedTypeDefinitions((prev) => ({ ...prev, [pkg.name]: true }));
        } catch (error) {
          console.error(
            `Failed to load type definitions for ${pkg.name}:`,
            error
          );
        }
      }
      setMonacoKey((prev) => prev + 1);
    };

    loadTypeDefinitions();
  }, [packages, monacoRef.current, loadedTypeDefinitions]);

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

  const handleEditorDidMount = (editor: any, monaco: any) => {
    monacoRef.current = monaco;
    editor.getModel()?.setEOL(0);

    requestAnimationFrame(() => {
      editor.layout();
      editor.focus();
    });
  };

  const handleFunctionSelect = (funcName: string, funcCode: string) => {
    setSelectedFunction(funcName);
    setEditorValue(funcCode);
    setEditorLanguage("tsx");
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
            
            </head>
            <body>
              <div id="app"></div>

              <script type="text/babel" data-presets="react,typescript" data-type="module">
              ${
                packages.length > 0 &&
                packages
                  .map((pkg) => {
                    const formattedName = pkg.name
                      .replace(/-|@|\//g, " ") // Ayrıştırıcıları boşlukla değiştir
                      .split(" ") // Kelimelere ayır
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      ) // İlk harfi büyük yap
                      .join(""); // Tekrar birleştir

                    return `import ${formattedName} from '${pkg.unpkgUrl}';`;
                  })
                  .join("\n")
              }

                ${getFormatedOneFile()}

                ReactDom.render(
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

  const handleInstallPackage = (newpkgs: Package[]) => {
    setPackages(
      newpkgs.map((pkg) => ({
        ...pkg,
        unpkgUrl: `https://cdn.skypack.dev/${pkg.name}`,
      }))
    );
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
      <UnpkgModal
        defaultPackages={packages}
        handleInstallPackage={handleInstallPackage}
        isOpen={unpkgModal}
        onOpenChange={setUnpkgModal}
      />

      <Modal isOpen={pkgDetailModal} onOpenChange={setPkgDetailModal}>
        <ModalContent>
          {/* Header Section */}
          <ModalHeader>
            <h2 className="text-lg font-semibold text-white">
              Package Details: {pkgDetail?.name || "Unknown Package"}
            </h2>
          </ModalHeader>

          {/* Body Section */}
          <ModalBody>
            {/* Imported From */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300">
                Imported From
              </h3>
              <p className="text-xs text-gray-400">
                {pkgDetail?.unpkgUrl || "No URL available"}
              </p>
            </div>

            {/* Example Usage */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300">
                Example Usage
              </h3>
              <div className="bg-gray-800 p-2 rounded text-xs text-gray-200 font-mono">
                <code>
                  const {`{}`} ={" "}
                  {pkgDetail &&
                    pkgDetail.name
                      .replace(/-|@|\//g, " ") // Replace delimiters with space
                      .split(" ") // Split into words
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      ) // Capitalize first letter
                      .join("")}
                </code>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300">Description</h3>
              <p className="text-xs text-gray-400">
                {pkgDetail?.description || "No description available."}
              </p>
            </div>
          </ModalBody>

          {/* Footer Section */}
          <ModalFooter>
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Version and License */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs rounded bg-blue-600 text-gray-200">
                  Version: {pkgDetail?.version || "N/A"}
                </span>
                <span className="px-3 py-1 text-xs rounded bg-green-600 text-gray-200">
                  License: {pkgDetail?.license || "Unknown"}
                </span>
              </div>

              {/* External Links */}
              <div className="flex items-center gap-3">
                {pkgDetail?.links?.homepage && (
                  <a
                    className="text-xs text-blue-400 hover:underline"
                    href={pkgDetail.links.homepage}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Homepage
                  </a>
                )}
                {pkgDetail?.links?.repository && (
                  <a
                    className="text-xs text-blue-400 hover:underline"
                    href={pkgDetail.links.repository}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Repository
                  </a>
                )}
                {pkgDetail?.links?.npm && (
                  <a
                    className="text-xs text-blue-400 hover:underline"
                    href={pkgDetail.links.npm}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    NPM
                  </a>
                )}
              </div>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
        <div className="w-1/6 h-full border flex flex-col border-white/20 rounded-lg">
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

          <div className="flex-1 w-full overflow-y-auto">
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

          <div className="max-h-[calc(100%)-10rem]h-[calc(100%)-10rem] w-full border rounded-lg border-white/20">
            <div className="flex items-center justify-between px-4 h-10 border-b border-white/10">
              <div className="flex items-center gap-2 w-full">
                <ChevronUp className="w-4 h-4 text-gray-400" />

                <div className="flex items-center gap-3">
                  <button
                    className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                    title="Add Package"
                    onClick={() => setUnpkgModal(true)}
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full overflow-y-auto">
              {packages.map((pkg, index) => (
                <div
                  key={index}
                  className="p-4 py-2 border-b flex items-center justify-between border-white/10 cursor-pointer"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-200">{pkg.name}</span>
                    <span className="text-xs text-gray-500">
                      {pkg.description.slice(0, 20)}...
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="px-2 py-1 text-xs rounded bg-slate-700 text-white">
                      {pkg.version}
                    </span>
                    <button
                      className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                      title="Remove Package"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setPackages((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                      title="Info Package"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setPkgDetail(pkg);
                        setPkgDetailModal(true);
                      }}
                    >
                      <Info className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
            key={monacoKey}
            height={editorHeight}
            language={editorLanguage}
            options={getEditorSettings()}
            value={editorValue}
            onChange={handleEditorChange}
            onMount={(editor, monaco) => {
              monacoRef.current = monaco;
              handleEditorDidMount(editor, monaco);
              generateMonaco(monaco);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ComplexWebEditor;
