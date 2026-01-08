import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../contexts/app/AppContext";
import BaseText from "../components/common/BaseText";
import { FontAwesome, AntDesign, Feather } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../navigation/NavigationTypes";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import RangeBottomModal, {
  RangeBottomModalHandle,
} from "../screens/Map/components/RangeBottomModal";
import { useRecordingStore } from "../stores/recordingStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { showCreate, setShowCreate } = useAppContext();
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const tabState = useNavigationState((state) => {
    const homeTabs = state.routes.find((r) => r.name === "HomeTabs");
    return homeTabs?.state;
  });

  const currentTabName =
    tabState && typeof tabState.index === "number"
      ? tabState.routes?.[tabState.index]?.name
      : undefined;

  const { isRecording, showRecording, setRouteRecord } = useRecordingStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);
  const rangeModalRef = useRef<RangeBottomModalHandle>(null);

  useEffect(() => {
    if (showCreate) {
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [showCreate]);

  return (
    <GestureHandlerRootView className="flex-1 relative">
      <BottomSheetModalProvider>
        <View className="flex-1">{children}</View>
        <RangeBottomModal ref={rangeModalRef} />
      </BottomSheetModalProvider>

      {visible && (
        <TouchableWithoutFeedback onPress={() => setShowCreate(false)}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: fadeAnim,
              },
            ]}
            className={
              "bg-black/40 flex-1 z-50 inset-0 justify-end items-center p-4"
            }
          >
            <View
              className="w-64 gap-y-2"
              style={{ paddingBottom: insets.bottom + 48 }}
            >
              {!showRecording && !isRecording && (
                <TouchableOpacity
                  className="w-full bg-white px-4 py-2 rounded-lg shadow-lg flex-row items-center gap-x-2"
                  onPress={() => {
                    if (currentTabName !== "Map") {
                      navigation.navigate("HomeTabs", {
                        screen: "Map",
                      });
                    }
                    setRouteRecord([]);
                    setShowCreate(false);
                    rangeModalRef.current?.open();
                  }}
                >
                  <FontAwesome
                    name="location-arrow"
                    size={24}
                    color="#2563eb"
                  />
                  <BaseText className="text-blue-600">
                    {t("main.record_route")}
                  </BaseText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="w-full bg-white px-4 py-2 rounded-lg shadow-lg flex-row items-center gap-x-2"
                onPress={() => {
                  navigation.navigate("CreateObstacle");
                  setShowCreate(false);
                }}
              >
                <AntDesign name="warning" size={24} color="#dc2626" />
                <BaseText className="text-red-600 ">
                  {t("main.report_obstacle")}
                </BaseText>
              </TouchableOpacity>
              {!showRecording && !isRecording && (
                <TouchableOpacity
                  className="w-full bg-white px-4 py-2 rounded-lg shadow-lg flex-row items-center gap-x-2"
                  onPress={() => {
                    navigation.navigate("CreatePost");
                    setShowCreate(false);
                  }}
                >
                  <Feather name="edit" size={24} color="#9333ea" />
                  <BaseText className="text-purple-600">
                    {t("main.add_post")}
                  </BaseText>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      )}
    </GestureHandlerRootView>
  );
}
