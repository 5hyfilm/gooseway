import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import BaseText from "./BaseText";

type Option = {
  label: string;
  value: string | boolean;
};

type Props = {
  options: Option[];
  selectedValue: string | boolean;
  onChange: (value: string | boolean) => void;
};

export default function BaseToggleSwitch({
  options,
  selectedValue,
  onChange,
}: Props) {
  const optionWidthsRef = useRef<number[]>([]);
  const [allMeasured, setAllMeasured] = useState(false);

  const translateX = useSharedValue(0);
  const toggleWidth = useSharedValue(0);

  const handleLayout = (index: number) => (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    optionWidthsRef.current[index] = width;

    if (optionWidthsRef.current.filter(Boolean).length === options.length) {
      if (!allMeasured) setAllMeasured(true);
    }
  };

  useEffect(() => {
    if (!allMeasured) return;

    const selectedIndex = options.findIndex(
      (opt) => opt.value === selectedValue
    );
    if (selectedIndex === -1) return;

    const offset = optionWidthsRef.current
      .slice(0, selectedIndex)
      .reduce((sum, w) => sum + w, 0);

    translateX.value = withTiming(offset, { duration: 200 });
    toggleWidth.value = withTiming(optionWidthsRef.current[selectedIndex], {
      duration: 200,
    });
  }, [selectedValue, allMeasured, options, translateX, toggleWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: toggleWidth.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="flex-row bg-white rounded-lg overflow-hidden p-1 shadow-sm">
      <Animated.View
        className="absolute h-full bg-blue-600 rounded-md z-0 top-1 left-1 right-1 bottom-1"
        style={animatedStyle}
      />

      {options.map((option, index) => (
        <Pressable
          key={index}
          className="z-10 px-2 py-1.5 items-center"
          onLayout={handleLayout(index)}
          onPress={() => onChange(option.value)}
        >
          <BaseText
            className={`text-xs ${
              selectedValue === option.value ? "text-white" : "text-blue-600"
            }`}
          >
            {option.label}
          </BaseText>
        </Pressable>
      ))}
    </View>
  );
}
