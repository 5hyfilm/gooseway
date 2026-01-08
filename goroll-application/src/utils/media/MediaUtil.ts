import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

export const handleCreateDirectory = async (directory: string) => {
  const dirInfo = await FileSystem.getInfoAsync(directory);
  if (!dirInfo.exists) {
    try {
      await FileSystem.makeDirectoryAsync(directory, {
        intermediates: true,
      });
    } catch (error: any) {
      console.error("Failed to create directory : ", error);
      Alert.alert("Failed to create directory : ", error.message);
    }
  }
};

export const handleUseCamera = async ({
  oldImagePath,
  directory,
  isCrop = true,
}: {
  oldImagePath?: string | null;
  directory: string;
  isCrop?: boolean;
}): Promise<string | null> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera access is required.");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: isCrop,
      aspect: [3, 4],
    });

    if (result.canceled) return null;

    if (oldImagePath) {
      await FileSystem.deleteAsync(oldImagePath, { idempotent: true });
    }

    const originalUri = result.assets[0].uri;
    const fileName = originalUri.split("/").pop() ?? `photo_${Date.now()}.jpg`;

    const fileInfo = await FileSystem.getInfoAsync(originalUri);
    const fileSizeInMB = fileInfo.exists ? fileInfo.size / (1024 * 1024) : 0;

    console.log("Original file size:", fileSizeInMB.toFixed(2), "MB");

    let outputUri = originalUri;

    if (fileSizeInMB > 10) {
      const manipulated = await ImageManipulator.manipulateAsync(
        originalUri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      outputUri = manipulated.uri;
    }

    const finalPath = `${directory}${fileName}`;

    await FileSystem.copyAsync({
      from: outputUri,
      to: finalPath,
    });

    if (outputUri !== originalUri) {
      await FileSystem.deleteAsync(outputUri, { idempotent: true });
    }
    await FileSystem.deleteAsync(originalUri, { idempotent: true });

    return finalPath;
  } catch (error: any) {
    console.error("Failed to capture image:", error);
    Alert.alert("Camera Error", error.message);
    return null;
  }
};

export const handleUseGallery = async (
  isCrop = true,
  isMuti = false
): Promise<string[] | null> => {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission denied", "Media library access is required.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: isCrop,
      aspect: [3, 4],
      allowsMultipleSelection: isMuti
    });

    if (result.canceled) return null;

    let convertUrl = result.assets.map((asset) => asset.uri);

    for (let index = 0; index < convertUrl.length; index++) {
      const element = convertUrl[index];
      const fileInfo = await FileSystem.getInfoAsync(element);
      const sizeInMB =
        fileInfo.exists && fileInfo.size ? fileInfo.size / (1024 * 1024) : 0;

      if (sizeInMB > 10) {
        const manipulated = await ImageManipulator.manipulateAsync(
          element,
          [{ resize: { width: 800 } }],
          {
            compress: 0.5,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        convertUrl.push(manipulated.uri);
      }
    }

    return convertUrl;
  } catch (error: any) {
    console.error("Failed to open gallery:", error);
    Alert.alert("Gallery Error", error.message);
    return null;
  }
};
