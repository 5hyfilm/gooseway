import React from "react";
import {
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import BaseText from "../common/BaseText";

type MediaModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
};

export default function MediaModal({
  modalVisible,
  setModalVisible,
  onCameraPress,
  onGalleryPress,
}: MediaModalProps) {
  const { t } = useTranslation();
  return (
    <Modal transparent animationType="fade" visible={modalVisible}>
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View className="position absolute inset-0 flex items-center justify-center">
          <View className="bg-white border border-gray-300 rounded-lg shadow-lg px-10 py-4 flex-row justify-center items-center gap-x-10">
            <TouchableOpacity
              className="flex-col items-center gap-x-2"
              onPress={onCameraPress}
            >
              <Ionicons name="camera" size={24} color="#3b82f6" />
              <BaseText className="text-blue-500">
                {t("profile.camera")}
              </BaseText>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-col items-center gap-x-2"
              onPress={onGalleryPress}
            >
              <MaterialIcons name="photo-library" size={24} color="#3b82f6" />
              <BaseText className="text-blue-500">
                {t("profile.gallery")}
              </BaseText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
