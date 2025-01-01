import { EditorProps } from "@monaco-editor/react";
import { create } from "zustand";
import { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki";

type EditorSettings = {
  fontSize: number;
  theme: string;
  tabSize: number;
  wordWrap: boolean;
  autoSave: boolean;
  lineNumbers: boolean;
  minimap: boolean;
};

type Output = {
  logs: string[];
  result: any;
  error: string | null;
};

type TabType = "files" | "output" | "ai" | "collaboration";

type EditorStore = {
  editorSettings: EditorSettings;
  output: Output;
  isRightPanelOpen: boolean;
  activeTab: TabType;
  isRunning: boolean;
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null;
  setEditorSettings: (settings: EditorSettings) => void;
  setOutput: (output: Output) => void;
  setIsRightPanelOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: TabType) => void;
  setIsRunning: (isRunning: boolean) => void;
  setHighlighter: (
    highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>
  ) => void;
  getEditorSettings: () => EditorProps["options"];
};

const useEditorStore = create<EditorStore>((set, get) => ({
  editorSettings: {
    fontSize: 14,
    theme: "aurora-x",
    tabSize: 2,
    wordWrap: true,
    autoSave: false,
    lineNumbers: true,
    minimap: true,
  },
  output: {
    logs: [],
    result: null,
    error: null,
  },
  isRightPanelOpen: false,
  activeTab: "files",
  isRunning: false,
  highlighter: null,
  setEditorSettings: (settings) =>
    set((state) => ({
      editorSettings: { ...state.editorSettings, ...settings },
    })),
  setOutput: (output) => set({ output }),
  setIsRightPanelOpen: (isOpen) => set({ isRightPanelOpen: isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsRunning: (isRunning) => set({ isRunning: isRunning }),
  setHighlighter: (highlighter) => set({ highlighter }),
  // @ts-ignore
  getEditorSettings: () => {
    const { editorSettings } = get();

    return {
      automaticLayout: true,
      padding: { top: 12, bottom: 12 },
      scrollBeyondLastLine: false,
      scrollbar: { vertical: "hidden", horizontal: "hidden" },
      folding: true,
      roundedSelection: false,
      renderWhitespace: "none",
      renderLineHighlight: "line",
      cursorBlinking: "solid",
      quickSuggestions: true,
      acceptSuggestionOnEnter: "off",
      contextmenu: false,
      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
      autoIndent: "full",
      autoClosingComments: "always",
      autoClosingDelete: "always",
      occurrencesHighlight: "multiFile",
      selectionHighlight: true,
      codeLens: false,
      renderControlCharacters: true,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: true,
      overviewRulerLanes: 0,
      formatOnPaste: true,
      formatOnType: false,
      ...editorSettings,
      lineNumbers: editorSettings.lineNumbers ? "on" : "off",
      minimap: { enabled: editorSettings.minimap },
    };
  },
}));

export default useEditorStore;
