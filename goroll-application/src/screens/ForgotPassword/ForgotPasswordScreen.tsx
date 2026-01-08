import React, { useCallback, useState } from "react";
import { View, TouchableOpacity, Image,Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import GorollIcon from "../../assets/goroll_icon.png";
import { validateEmail } from "../../utils/auth/AuthValidator";
import { useForgotPassword } from "../../services/api/hooks/useAuth";
import Ionicons from "@expo/vector-icons/Ionicons";

import BaseButton from "../../components/common/BaseButton";
import BaseText from "../../components/common/BaseText";
import FormInput from "../../components/form/FormInput";

type ErrorType = "EMPTY" | "FORMAT" | null;

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const route = useRoute<RouteProp<RootStacksParamList, "ForgotPassword">>();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState(route.params?.email || "");
  const [emailError, setEmailError] = useState<ErrorType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const forgotPasswordMutation = useForgotPassword();

  const handleValidateEmail = useCallback(() => {
    if (!email) {
      setEmailError("EMPTY");
      return false;
    }
    const isValid = validateEmail(email);
    setEmailError(isValid ? null : "FORMAT");
    return isValid;
  }, [email]);

  const handleResetPassword = useCallback(async () => {
    try {
      setIsSubmitting(true);

      const isEmailValid = handleValidateEmail();

      if (!isEmailValid) return;

      await forgotPasswordMutation.mutateAsync(email);

      navigation.replace("ResetSuccess");
    } catch (error) {
      console.error("Error during sign-in:", error);
      Alert.alert(
        t("auth.error_reset"),
        t("auth.reset_password_error"),
        [{ text: t("main.ok") }]
      );
    }
  }, [email, handleValidateEmail]);

  return (
    <View
      className="flex-1 items-center p-6 gap-y-8"
      style={{
        paddingTop: insets.top + 24,
        paddingLeft: insets.left + 24,
        paddingRight: insets.right + 24,
        paddingBottom: insets.bottom + 24,
      }}
    >   
      <TouchableOpacity
        disabled={forgotPasswordMutation.isPending}
        onPress={() => navigation.goBack()}
        className="absolute"
        style={{
          top: insets.top + 24,
          left: insets.left + 24,
        }}
      >
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      <Image source={GorollIcon} className="h-20 w-32" resizeMode="contain" />
      <View className="items-center gap-y-2">
        <BaseText className="text-3xl" fontWeight="bold">{t("auth.forgot_password")}</BaseText>
        <BaseText className="font-noto text-gray-600">
          {t("auth.please_enter_email_for_reset")}
        </BaseText>
      </View>

      <View className="gap-y-1.5 w-full">
        <FormInput
          label={t("auth.email")}
          placeholder={t("auth.enter_email")}
          value={email}
          onChangeText={(text) => setEmail(text.trim())}
          keyboardType="email-address"
          onError={emailError !== null}
          onBlur={() => isSubmitting && handleValidateEmail()}
          errorMessage={
            emailError === "EMPTY"
              ? t("auth.please_enter_email")
              : t("auth.invalid_email")
          }
          autoCapitalize="none"
          autoCorrect={false}
        />

        <BaseButton onPress={handleResetPassword} className="bg-blue-600 w-full" loading={forgotPasswordMutation.isPending}>
          <BaseText className="text-white text-center">
            {t("auth.send_email")}
          </BaseText>
        </BaseButton>
      </View>
    </View>
  );
}
