import { create } from "zustand";

export interface File {
  filename: string;
  content: string;
  isFile: boolean;
  isFolder?: boolean;
  children?: { [key: string]: any };
}

type FileStore = {
  files: File[];
  setFiles: (files: { filename: string; content: string }[]) => void;
};

const useReactStore = create<FileStore>((set, get) => ({
  files: [],
  setFiles: (files) => set({ files: Object.values(createFolderStructure(files)) }),
}));

export default useReactStore;

function createFolderStructure(
  files: { filename: string; content: string }[]
): { [key: string]: any } {
  const root: { [key: string]: any } = {};

  for (const file of files) {
    const pathParts = file.filename.split("/").filter(Boolean);
    let current = root;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = { isFolder: true, children: {} };
      }
      current = current[part].children;
    }

    const fileName = pathParts[pathParts.length - 1];
    current[fileName] = { ...file, isFile: true };
  }

  return root;
}
