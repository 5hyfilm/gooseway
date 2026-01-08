import apiFetch from "../api";

export type UploadData = {
  errors?: string[];
  messages?: string[];
  result?: {
    filename: string;
    id: string;
    requireSignedURLs: boolean;
    uploaded: string;
    variants: string[];
  };
  success: boolean;
};

export const uploadFile = async (file: File): Promise<UploadData> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};