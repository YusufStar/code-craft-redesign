import { axiosInstance } from "@/hooks/useAxios";
import { FileType, FolderType } from "@/store/fileStore";

export const fetchFolders = async (): Promise<FolderType[]> => {
  try {
    const response = await axiosInstance.get("/folders");

    return response.data.map((folder: any) => ({
      ...folder,
      type: "folder",
      files: folder.files.map((file: any) => ({
        ...file,
        type: "file",
      })),
    }));
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw error;
  }
};

export const createFolder = async (
  name: string,
  parentId?: string
): Promise<FolderType> => {
  try {
    const response = await axiosInstance.post("/folders", {
      name,
      parentId,
    });

    return { ...response.data, type: "folder", files: [] };
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
};

export const updateFolder = async (
  id: string,
  name: string
): Promise<FolderType> => {
  try {
    const response = await axiosInstance.put(`/folders/${id}`, { name });

    return { ...response.data, type: "folder" };
  } catch (error) {
    console.error("Error updating folder:", error);
    throw error;
  }
};

export const deleteFolder = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/folders/${id}`);
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
};

export const createFile = async (
  name: string,
  folderId: string
): Promise<FileType> => {
  try {
    const response = await axiosInstance.post("/files", { name, folderId });

    return { ...response.data, type: "file" };
  } catch (error) {
    console.error("Error creating file:", error);
    throw error;
  }
};

export const updateFile = async (
  id: string,
  name: string,
  content: string
): Promise<FileType> => {
  try {
    const response = await axiosInstance.put(`/files/${id}`, { name, content });

    return { ...response.data, type: "file" };
  } catch (error) {
    console.error("Error updating file:", error);
    throw error;
  }
};

export async function deleteFile(fileId: string) {
  try {
    const { data } = await axiosInstance.delete(`/files/${fileId}`);

    return data;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export const updateFileContent = async (
  id: string,
  content: string
): Promise<FileType> => {
  try {
    const response = await axiosInstance.put(`/files/code/${id}`, { content });

    return { ...response.data, type: "file" };
  } catch (error) {
    console.error("Error updating file content:", error);
    throw error;
  }
};
