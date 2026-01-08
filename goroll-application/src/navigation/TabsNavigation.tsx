import React from "react";
import { View, Pressable,Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../contexts/app/AppContext";
import { useRecordingStore } from "../stores/recordingStore";

import MapScreen from "../screens/Map/MapScreen";
import SearchScreen from "../screens/Search/SearchScreen";
import CommunityScreen from "../screens/Community/CommunityScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

import TabsLayout from "../layouts/TabsLayout";

import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";

const Tab = createBottomTabNavigator();

export function RootTabs() {
  const { t } = useTranslation();
  const { fontFamily, showCreate, setShowCreate } = useAppContext();
  const { isRecording } = useRecordingStore();

  return (
    <Tab.Navigator
      screenOptions={{
        animation: "none",
        tabBarLabelStyle: {
          fontFamily: fontFamily(),
        },
        tabBarStyle: {
          zIndex: 100,
          // elevation: 10,
          //  position: 'absolute'
        },
        headerTitleStyle: {
          fontFamily: fontFamily(),
        },
      }}
      screenListeners={() => ({
        tabPress: (e) => {
          if (isRecording) {
            e.preventDefault();
            Alert.alert(
              t("location.recording_prompt"),
              t("location.recording_prompt_message")
            );
          }
        }
      })}
      layout={TabsLayout}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: t("main.map"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="map" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: t("main.search"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        options={{
          title: "",
          tabBarButton: () => (
            <View className="justify-center items-center">
              <Pressable
                style={{
                  top: -5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                className={`bg-blue-500 rounded-full w-14 h-14 transition-transform duration-300 ${
                  showCreate ? "rotate-[135deg]" : "rotate-0"
                }`}
                onPress={() => {
                  // if (isRecording) return;
                  setShowCreate(!showCreate);
                }}
              >
                <AntDesign name="plus" size={24} color="white" />
              </Pressable>
            </View>
          ),
        }}
      >
        {() => null}
      </Tab.Screen>
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          title: t("main.community"),
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="earth" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t("main.profile"),
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
    </Tab.Navigator>
  );
}
