import axiosInstance from "../../services/api/api";
import * as FileSystem from "expo-file-system";

export const uploadImage = async (imageUri: string): Promise<string> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);    

    if (!fileInfo.exists) {
      console.error("File does not exist:", imageUri);
      throw new Error("File does not exist");
    }

    const fileName = imageUri.split("/").pop();
    if (!fileName) {
      console.error("Failed to extract file name from URI:", imageUri);
      throw new Error("Invalid file name");
    }

    const formData = new FormData();
    formData.append("file", {
      uri: fileInfo.uri,
      type: "image/jpeg",
      name: fileName,
    } as any);
    formData.append("type", "counting-images");

    const res = await axiosInstance.post("upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    await FileSystem.deleteAsync(imageUri, { idempotent: true });

    return res.data.result?.variants[0] || "";
  } catch (error) {
    console.error("Failed to upload image:", error);
    return "";
  }
};
