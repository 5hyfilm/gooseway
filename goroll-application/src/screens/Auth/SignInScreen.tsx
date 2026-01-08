import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth/AuthContext";
import { Feather, AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../contexts/app/AppContext";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import GorollIcon from "../../assets/goroll_icon.png";
import {
  validateEmail,
  validatePassword,
} from "../../utils/auth/AuthValidator";
import { useLoginUsers, useCheckEmail } from "../../services/api/hooks/useAuth";
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { authGoogleOAuth } from "../../services/api/models/Auth";

import BaseButton from "../../components/common/BaseButton";
import BaseText from "../../components/common/BaseText";
import FormInput from "../../components/form/FormInput";

import { handleAxiosError } from "../../services/api/api";

type ErrorType = "EMPTY" | "FORMAT" | null;

export default function SignInScreen() {
  const { handleSetUserInfo } = useAuth();
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const insets = useSafeAreaInsets();
  const { handleShowError } = useAppContext();

  const [email, setEmail] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);
  const [emailError, setEmailError] = useState<ErrorType>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<ErrorType>(null);
  const [seePassword, setSeePassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const useLoginUsersMutation = useLoginUsers();
  const useCheckEmailMutation = useCheckEmail();

  const handleGoogleLogin = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();
      setIsLoading(true);
      if (isSuccessResponse(res)) {
        const { idToken } = res.data;
        if (idToken) {
          const response = await authGoogleOAuth(idToken);
          handleSetUserInfo({
            id: response.user.id,
            email: response.user.email,
            fullName: response.user.fullName,
            avatarUrl: response.user.avatarUrl || "",
            accessToken: response.accessToken,
          });
        }
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.error("Sign-in in progress:", error.message);
            handleShowError("Sign-in in progress", error.message);
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.error("Play services not available:", error.message);
            handleShowError("Play services not available", error.message);
            break;
          default:
            console.error("Google Sign-In error:", error.code, error.message);
            handleShowError("Google Sign-In error", error.message);
            break;
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleSetUserInfo, handleShowError]);

  const handleValidateEmail = useCallback(() => {
    if (!email) {
      setEmailError("EMPTY");
      return false;
    }
    const isValid = validateEmail(email);
    setEmailError(isValid ? null : "FORMAT");
    return isValid;
  }, [email]);

  const handleCheckEmail = useCallback(async () => {
    try {
      const isValid = handleValidateEmail();
      if (!isValid) {
        setCheckEmail(false);
        return false;
      }
      const res = await useCheckEmailMutation.mutateAsync(email.trim());

      if (!res) {
        setCheckEmail(false);
        setEmailError("FORMAT");
        return false;
      } else if (res.authProviders[0]?.providerName === "google") {
        Alert.alert(
          t("auth.google_account_detected"),
          t("auth.google_account_message"),
          [
            {
              text: t("main.cancel"),
              style: "cancel",
            },
            {
              text: t("auth.continue_with_google"),
              onPress: handleGoogleLogin,
            },
          ]
        );
        return false;
      }

      setCheckEmail(isValid);
      return isValid;
    } catch (error) {
      console.error("Error checking email:", error);
      handleAxiosError(error, handleShowError);
      setCheckEmail(false);
      setEmailError("FORMAT");
      return false;
    }
  }, [email, handleShowError]);

  const handleValidatePassword = useCallback(() => {
    if (!password) {
      setPasswordError("EMPTY");
      return false;
    }
    const { isValid } = validatePassword(password);
    setPasswordError(isValid ? null : "FORMAT");
    return isValid;
  }, [password]);

  const handleSignIn = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const isEmailChecked = await handleCheckEmail();
      if (!isEmailChecked) {
        return;
      }

      const isEmailValid = handleValidateEmail();
      const isPasswordValid = handleValidatePassword();

      if (!isEmailValid || !isPasswordValid) {
        return;
      }

      const { user, accessToken } = await useLoginUsersMutation.mutateAsync({
        email: email.trim(),
        password: password.trim(),
      });

      handleSetUserInfo({
        ...user,
        avatarUrl: user.avatarUrl ?? "",
        accessToken,
      });
    } catch (error) {
      handleAxiosError(error, handleShowError);
    }
  }, [
    email,
    handleSetUserInfo,
    handleValidateEmail,
    handleValidatePassword,
    handleShowError,
  ]);

  return (
    <>
      {isLoading && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          className="flex-1 absolute z-50 bg-black/50 inset-0 items-center justify-center"
        >
          <ActivityIndicator size={50} color="#ffffff" />
        </Animated.View>
      )}
      <View
        className="flex-1 items-center p-6 gap-y-8"
        style={{
          paddingTop: insets.top + 24,
          paddingLeft: insets.left + 24,
          paddingRight: insets.right + 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Image source={GorollIcon} className="h-20 w-32" resizeMode="contain" />
        <View className="items-center gap-y-2">
          <Text className="font-inter-bold text-3xl">{t("main.goroll")}</Text>
          <BaseText className="font-noto text-gray-600">
            {t("auth.welcome_back")}
          </BaseText>
        </View>

        <BaseButton
          className="flex-row gap-x-2 justify-center items-center border border-gray-300"
          onPress={handleGoogleLogin}
        >
          <AntDesign name="google" size={20} color="#374151" />
          <BaseText className="text-gray-700 text-center">
            {t("auth.continue_google")}
          </BaseText>
        </BaseButton>

        <View className="flex-row items-center">
          <View className="flex-1 h-px bg-gray-300" />
          <BaseText className="mx-4 text-gray-500">
            {t("auth.or_continue")}
          </BaseText>
          <View className="flex-1 h-px bg-gray-300" />
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
          {checkEmail && (
            <Animated.View
              className="gap-y-1.5 pb-6"
              entering={FadeInDown.duration(300)}
              exiting={FadeOutUp.duration(200)}
            >
              <FormInput
                label={t("auth.password")}
                placeholder={t("auth.enter_password")}
                value={password}
                onChangeText={(text) => setPassword(text.trim())}
                rightIcon={() => (
                  <Pressable onPress={() => setSeePassword((prev) => !prev)}>
                    {seePassword ? (
                      <Feather name="eye" size={20} color="#6b7280" />
                    ) : (
                      <Feather name="eye-off" size={20} color="#6b7280" />
                    )}
                  </Pressable>
                )}
                secureTextEntry={seePassword}
                onError={passwordError !== null}
                errorMessage={
                  passwordError === "EMPTY"
                    ? t("auth.please_enter_password")
                    : t("auth.invalid_password")
                }
                onBlur={() => isSubmitting && handleValidatePassword()}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View className="flex-row justify-end">
                <TouchableOpacity
                  onPress={() => navigation.push("ForgotPassword", { email })}
                >
                  <BaseText className="text-gray-600 text-sm">
                    {t("auth.forgot_password")}
                  </BaseText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          <BaseButton
            className="bg-blue-600 w-full"
            onPress={checkEmail ? handleSignIn : handleCheckEmail}
            loading={
              useLoginUsersMutation.isPending || useCheckEmailMutation.isPending
            }
          >
            <BaseText className="text-white text-center">
              {checkEmail ? t("auth.sign_in") : t("main.next")}
            </BaseText>
          </BaseButton>
        </View>

        <View className="flex-row justify-center items-center gap-x-1">
          <BaseText className="text-gray-600 text-sm">
            {t("auth.dont_have_account")}
          </BaseText>
          <TouchableOpacity
            disabled={
              useLoginUsersMutation.isPending || useCheckEmailMutation.isPending
            }
            onPress={() => navigation.navigate("SignUp")}
          >
            <BaseText className="text-blue-600 text-sm">
              {t("auth.creat_account")}
            </BaseText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
