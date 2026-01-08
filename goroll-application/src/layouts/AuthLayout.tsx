import React, { useState, useCallback, useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../contexts/app/AppContext";

import KeyboardScrollLayout from "./KeyboardScrollLayout";
import BaseToggleSwitch from "../components/common/BaseToggleSwitch";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { language, handleSetLanguage } = useAppContext();

  const switchOptions = useMemo(
    () => [
      { label: "TH", value: "th" },
      { label: "EN", value: "en" },
    ],
    []
  );

  const [selected, setSelected] = useState<"en" | "th">(language);

  const handleLanguageChange = useCallback(
    (value: string | boolean) => {
      if (typeof value === "string") {
        const lang = value as "en" | "th";
        setSelected(lang);
        handleSetLanguage(lang);
      }
    },
    [handleSetLanguage]
  );

  return (
    <KeyboardScrollLayout>
      <View
        className="absolute"
        style={{
          top: insets.top + 24,
          right: insets.right + 24,
        }}
      >
        <BaseToggleSwitch
          options={switchOptions}
          selectedValue={selected}
          onChange={handleLanguageChange}
        />
      </View>
      {children}
    </KeyboardScrollLayout>
  );
}
