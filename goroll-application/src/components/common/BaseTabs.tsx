import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import BaseText from "./BaseText";

type TabType = {
  key: string;
  title: string;
  icon: (active: boolean) => React.ReactNode;
  component: React.FC;
};

function HeaderTabs({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: TabType[];
  activeTab: number;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <FlatList
      data={tabs}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.key}
      contentContainerStyle={{
        padding: 16,
        gap: 32,
      }}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          className="justify-center items-center gap-y-1"
          onPress={() => setActiveTab(index)}
        >
          {item.icon(index === activeTab)}
          <BaseText
            className={`text-sm ${
              activeTab === index ? "text-blue-500" : "text-black"
            }`}
          >
            {item.title}
          </BaseText>
        </TouchableOpacity>
      )}
    />
  );
}

function TabContent({
  tabs,
  activeTab,
  hasMounted,
}: {
  tabs: TabType[];
  activeTab: number;
  hasMounted: React.MutableRefObject<boolean>;
}) {
  return (
    <View className="flex-1">
      {tabs.map((item, index) => {
        if (activeTab === index) {
          return hasMounted.current ? (
            <Animated.View key={item.key} entering={FadeIn} exiting={FadeOut}>
              <item.component />
            </Animated.View>
          ) : (
            <View key={item.key}>
              <item.component />
            </View>
          );
        }
        return null;
      })}
    </View>
  );
}

export default function BaseTabs({tabs}: {tabs: TabType[]}) {
  const [activeTab, setActiveTab] = useState(0);
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  return (
    <View className="flex-1">
      <HeaderTabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <TabContent tabs={tabs} activeTab={activeTab} hasMounted={hasMounted} />
    </View>
  );
}
