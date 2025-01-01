import { create } from "zustand";

export type FileType = {
  id: string;
  name: string;
  content: string;
  type: "file";
};

export type FolderType = {
  id: string;
  name: string;
  type: "folder";
  files: FileType[];
  children: FolderType[];
};

type FileStore = {
  folderStructure: FolderType[];
  setFolderStructure: (folderStructure: FolderType[]) => void;
  updateContent: (path: string, content: string) => void;
  getFileContent: (path: string) => string | undefined;
  openFiles: string[];
  addOpenFile: (path: string) => void;
  removeOpenFile: (fileId: string) => void;
  activeFile: string;
  setActiveFile: (path: string) => void;
  getFiles: () => FileType[];
  selectedFile: FileType | null;
  setSelectedFile: (file: FileType | null) => void;
  openFolders: Record<string, boolean>;
  toggleFolder: (path: string) => void;
};

const useFileStore = create<FileStore>((set, get) => ({
  folderStructure: [],
  setFolderStructure: (folderStructure) => set({ folderStructure }),
  updateContent: (path, content) => {
    set((state) => ({
      folderStructure: state.folderStructure.map((folder) =>
        updateFolderContent(folder, path, content)
      ),
    }));
  },
  getFileContent: (path) => {
    let content: string | undefined;

    const findContent = (folders: FolderType[]) => {
      for (const folder of folders) {
        for (const file of folder.files) {
          if (file.id === path) {
            content = file.content;

            return;
          }
        }
        if (folder.children) {
          findContent(folder.children);
        }
      }
    };

    findContent(get().folderStructure);

    return content;
  },
  openFiles: [],
  addOpenFile: (path) => {
    set((state) => {
      if (!state.openFiles.includes(path)) {
        return { openFiles: [...state.openFiles, path], activeFile: path };
      }

      return { ...state, activeFile: path };
    });
  },
  removeOpenFile: (fileId: string) => {
    set((state) => ({
      openFiles: state.openFiles.filter((id) => id !== fileId),
      activeFile:
        state.activeFile === fileId
          ? state.openFiles.filter((id) => id !== fileId)[0] || ""
          : state.activeFile,
    }));
  },
  activeFile: "",
  setActiveFile: (path) => set({ activeFile: path }),
  getFiles: () => {
    const files: FileType[] = [];

    const traverseFolders = (folders: FolderType[]) => {
      folders.forEach((folder) => {
        files.push(...folder.files);
        if (folder.children) {
          traverseFolders(folder.children);
        }
      });
    };

    traverseFolders(get().folderStructure);

    return files;
  },
  selectedFile: null,
  setSelectedFile: (file) => set({ selectedFile: file }),
  openFolders: {},
  toggleFolder: (path) => {
    set((state) => {
      const openFolders = { ...state.openFolders };

      if (openFolders[path]) {
        delete openFolders[path];
      } else {
        openFolders[path] = true;
      }

      return { openFolders };
    });
  },
}));

// Helper function to update content recursively
const updateFolderContent = (
  folder: FolderType,
  path: string,
  content: string
): FolderType => {
  return {
    ...folder,
    files: folder.files.map((file) =>
      file.id === path ? { ...file, content } : file
    ),
    children: folder.children.map((child) =>
      updateFolderContent(child, path, content)
    ),
  };
};

export default useFileStore;
