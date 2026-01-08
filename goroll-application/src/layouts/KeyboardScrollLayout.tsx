import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  Platform,
} from "react-native";

export default function KeyboardScrollLayout({
  children,
  scrollEnabled = true,
}: {
  children: React.ReactNode;
  scrollEnabled?: boolean;
}) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );

    const hideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={keyboardVisible ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
