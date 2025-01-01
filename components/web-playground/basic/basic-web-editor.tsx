"use client";
import { useState, useRef, useEffect } from "react";
import { Image } from "@nextui-org/image";
import { Download, Fullscreen, Settings } from "lucide-react";
import { type Monaco } from "@monaco-editor/react";
import { AnimatePresence, m, motion } from "framer-motion";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { shikiToMonaco } from "@shikijs/monaco";
import { Skeleton } from "@nextui-org/skeleton";
import dynamic from "next/dynamic";

import { languageIcons } from "@/constants/icons";
import EditorSettings from "@/components/editors/EditorSettings";
import useEditorStore from "@/store/editorStore";
import useMounted from "@/hooks/useMounted";
import { Modal, ModalContent, ModalHeader } from "@nextui-org/modal";
import { Button } from "@nextui-org/button";

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

const BasicWebEditor = () => {
  const { getEditorSettings } = useEditorStore();
  const [settingsModal, setSettingsModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loadEditorModal, setLoadEditorModal] = useState(true);
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
  const htmlMonacoRefInstance = useRef<Monaco | null>(null);
  const jsMonacoRefInstance = useRef<Monaco | null>(null);
  const cssMonacoRefInstance = useRef<Monaco | null>(null);
  const { highlighter } = useEditorStore();
  const shikiLoadedHtml = useRef(false);
  const shikiLoadedJs = useRef(false);
  const shikiLoadedCss = useRef(false);

  const handleSettings = () => {
    setSettingsModal(true);
  };

  const handleDownload = async (type: "html" | "css" | "javascript") => {
    const zip = new JSZip();
    let content;
    if (type === "html") {
      zip.file("index.html", htmlMonacoRef.current?.getValue() || "");
      content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "index.html.zip");
    } else if (type === "css") {
      zip.file("style.css", cssMonacoRef.current?.getValue() || "");
      content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "style.css.zip");
    } else if (type === "javascript") {
      zip.file("script.js", jsMonacoRef.current?.getValue() || "");
      content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "script.js.zip");
    }
  };

  useEffect(() => {
    const loadShiki = async () => {
      if (
        htmlMonacoRefInstance.current &&
        !shikiLoadedHtml.current &&
        highlighter
      ) {
        shikiToMonaco(highlighter, htmlMonacoRefInstance.current);
        shikiLoadedHtml.current = true;
      }
      if (
        jsMonacoRefInstance.current &&
        !shikiLoadedJs.current &&
        highlighter
      ) {
        shikiToMonaco(highlighter, jsMonacoRefInstance.current);
        shikiLoadedJs.current = true;
      }
      if (
        cssMonacoRefInstance.current &&
        !shikiLoadedCss.current &&
        highlighter
      ) {
        shikiToMonaco(highlighter, cssMonacoRefInstance.current);
        shikiLoadedCss.current = true;
      }
    };

    loadShiki();
  }, [
    htmlMonacoRefInstance.current,
    shikiLoadedHtml.current,
    jsMonacoRefInstance.current,
    shikiLoadedJs.current,
    cssMonacoRefInstance.current,
    shikiLoadedCss.current,
    highlighter,
  ]);

  const handleEditorDidMount = (
    editor: any,
    monaco: any,
    type: "html" | "css" | "javascript"
  ) => {
    if (type === "html") {
      htmlMonacoRef.current = editor;
      htmlMonacoRefInstance.current = monaco;
    } else if (type === "css") {
      cssMonacoRef.current = editor;
      cssMonacoRefInstance.current = monaco;
    } else if (type === "javascript") {
      jsMonacoRef.current = editor;
      jsMonacoRefInstance.current = monaco;
    }
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

      <Modal backdrop="blur" isOpen={loadEditorModal} onOpenChange={setLoadEditorModal}>
        <ModalHeader className="flex flex-col gap-1">
          Basic Web Editor
        </ModalHeader>
        <ModalContent>
          {(onClose) => (
            <div className="p-6 bg-background rounded-lg shadow-lg max-w-md mx-auto">
              <h1 className="text-2xl font-extrabold text-white/100 mb-4">
                Web Editor Pro
              </h1>
              <p className="text-white/50 leading-relaxed mb-6">
                Seamlessly edit and preview your HTML, CSS, and JavaScript in
                one place. Elevate your web development experience.
              </p>
              <Button fullWidth variant="bordered" color="success" onClick={onClose}>
                Start Coding
              </Button>
            </div>
          )}
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
            onClick={() => handleDownload("html")}
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
                onClick={() => handleDownload("html")}
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <MonacoEditor
            height={htmlEditorHeight}
            language="html"
            options={getEditorSettings()}
            onMount={(editor, monaco) => {
              handleEditorDidMount(editor, monaco, "html");
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
                onClick={() => handleDownload("javascript")}
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <MonacoEditor
            height={jsEditorHeight}
            language="javascript"
            options={getEditorSettings()}
            onMount={(editor, monaco) => {
              handleEditorDidMount(editor, monaco, "javascript");
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
                onClick={() => handleDownload("css")}
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <MonacoEditor
            height={cssEditorHeight}
            language="css"
            options={getEditorSettings()}
            onMount={(editor, monaco) => {
              handleEditorDidMount(editor, monaco, "css");
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
