import { create } from "zustand";

export interface File {
  filename: string;
  content: string;
  isFile: boolean;
  isFolder?: boolean;
  children?: { [key: string]: any };
  id?: string;
  name?: string;
  type?: "file" | "folder";
}

export interface Folder {
  id: string;
  name: string;
  type: "folder";
  children?: Folder[];
  files?: File[];
}

export interface Dependency {
  [key: string]: string;
}

type FileStore = {
  files: File[];
  setFiles: (files: { filename: string; content: string }[]) => void;
  openFiles: string[];
  addOpenFile: (file: string) => void;
  removeOpenFile: (file: string) => void;
  activeFile: string | null;
  setActiveFile: (file: string | null) => void;
  updateContent: (file: string, content: string) => void;
  getFileContent: (file: string) => string | undefined;
  getFiles: () => File[];
  folderStructure: Folder[];
  setFolderStructure: (folders: Folder[]) => void;
  openFolders: { [key: string]: boolean };
  toggleFolder: (folderId: string) => void;
  dependencies: Dependency | null;
  setDependencies: (dependencies: Dependency) => void;
};

const useReactStore = create<FileStore>((set, get) => ({
  files: [],
  setFiles: (files) => set({ files: files as File[] }),
  openFiles: [],
  addOpenFile: (file) =>
    set((state) => {
      if (state.openFiles.includes(file)) {
        return state;
      }

      return { openFiles: [...state.openFiles, file] };
    }),
  removeOpenFile: (file) =>
    set((state) => ({ openFiles: state.openFiles.filter((f) => f !== file) })),
  activeFile: null,
  setActiveFile: (file) => set({ activeFile: file }),
  updateContent: (file, content) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.filename === file ? { ...f, content } : f
      ),
    })),
  getFileContent: (file) =>
    get().files.find((f) => f.filename === file)?.content,
  getFiles: () => get().files,
  folderStructure: [],
  setFolderStructure: (folders) => {
    set({ folderStructure: folders });
    const filesFromFolders = (folders: any[]): File[] => {
      let files: File[] = [];

      for (const item of folders) {
        if (item.type === "file") {
          files.push(item);
        } else if (item.children) {
          files.push(...filesFromFolders(Object.values(item.children)));
        }
      }

      return files;
    };

    set({ files: filesFromFolders(folders) });
  },
  openFolders: {},
  toggleFolder: (folderId) =>
    set((state) => ({
      openFolders: {
        ...state.openFolders,
        [folderId]: !state.openFolders[folderId],
      },
    })),
  dependencies: null,
  setDependencies: (dependencies) => set({ dependencies }),
}));

export default useReactStore;
