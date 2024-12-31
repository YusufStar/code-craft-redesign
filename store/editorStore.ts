import { create } from "zustand";

type EditorSettings = {
  fontSize: number;
  language: string;
  theme: string;
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
  setEditorSettings: (settings: EditorSettings) => void;
  setOutput: (output: Output) => void;
  setIsRightPanelOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: TabType) => void;
  setIsRunning: (isRunning: boolean) => void;
};

const useEditorStore = create<EditorStore>((set) => ({
  editorSettings: {
    fontSize: 14,
    language: "javascript",
    theme: "dark-plus",
  },
  output: {
    logs: [],
    result: null,
    error: null,
  },
  isRightPanelOpen: false,
  activeTab: "files",
  isRunning: false,
  setEditorSettings: (settings) =>
    set((state) => ({
      editorSettings: { ...state.editorSettings, ...settings },
    })),
  setOutput: (output) => set({ output }),
  setIsRightPanelOpen: (isOpen) => set({ isRightPanelOpen: isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsRunning: (isRunning) => set({ isRunning: isRunning }),
}));

export default useEditorStore; 