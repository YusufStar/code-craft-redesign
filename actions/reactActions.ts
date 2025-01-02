import { axiosInstance } from "@/hooks/useAxios";

export type FileType = {
  filename: string;
  content: string;
  isFile: boolean;
  id: string;
  name: string;
  type: string;
};

export const updateFile = async (
  projectId: string,
  oldFilename: string,
  newFilename: string
): Promise<FileType> => {
  try {
    const response = await axiosInstance.put(`/react/${projectId}/files/name`, { oldFilename, newFilename });

    return { ...response.data, type: "file" };
  } catch (error) {
    console.error("Error updating file:", error);
    throw error;
  }
};

export const updateFileContent = async (
  projectId: string,
  filename: string,
  content: string
): Promise<FileType> => {
  try {
    const response = await axiosInstance.put(`/react/${projectId}/files/content`, { filename, content });

    return { ...response.data, type: "file" };
  } catch (error) {
    console.error("Error updating file content:", error);
    throw error;
  }
};

export const updateFolder = async (
  projectId: string,
  oldFilename: string,
  newFilename: string
): Promise<FileType> => {
  try {
    const response = await axiosInstance.put(`/react/${projectId}/folders/name`, { oldFilename, newFilename });

    return { ...response.data, type: "file" };
  } catch (error) {
    console.error("Error updating folder:", error);
    throw error;
  }
};
