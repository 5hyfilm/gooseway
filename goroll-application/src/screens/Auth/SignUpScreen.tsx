import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth/AuthContext";
import { Feather, AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { useRegisterUsers } from "../../services/api/hooks/useAuth";
import { useAppContext } from "../../contexts/app/AppContext";

import {
  validateEmail,
  validatePassword,
} from "../../utils/auth/AuthValidator";

import GorollIcon from "../../assets/goroll_icon.png";

import BaseButton from "../../components/common/BaseButton";
import BaseText from "../../components/common/BaseText";
import FormInput from "../../components/form/FormInput";
import { handleAxiosError } from "../../services/api/api";

type EmailErrorType = "EMPTY" | "FORMAT" | null;

type PasswordValidType = {
  isValid: boolean;
  isValidLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  typesCount: number;
};

export default function SignUpScreen() {
  const { handleSetUserInfo } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { handleShowError } = useAppContext();

  const fullNameRef = useRef<TextInput>(null);
  const phoneNumberRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<EmailErrorType>(null);
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState<
    Partial<PasswordValidType>
  >({});
  const [seePassword, setSeePassword] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerMutation = useRegisterUsers();

  const handleValidateEmail = useCallback(() => {
    if (!email.trim()) {
      setEmailError("EMPTY");
      return false;
    }
    const isValid = validateEmail(email.trim());
    setEmailError(isValid ? null : "FORMAT");
    return isValid;
  }, [email]);

  const handleValidatePassword = useCallback((password: string) => {
    const result = validatePassword(password);
    setPasswordValid(result);
    return result.isValid;
  }, []);

  const handleValidPhoneNumber = useCallback(() => {
    const isValid = /^\d{10}$/.test(phoneNumber);

    setPhoneNumberError(!isValid);
    return isValid;
  }, [phoneNumber]);

  const confirmPasswordError = useCallback(() => {
    if (!confirmPassword.trim()) return t("auth.please_enter_password");
    if (password !== confirmPassword) return t("auth.invalid_confirm_password");
    return "";
  }, [password, confirmPassword, t]);

  const handleSignUp = useCallback(async () => {
    try {
      setIsSubmitting(true);

      const isEmailValid = handleValidateEmail();
      const isPasswordValid = handleValidatePassword(password);
      const isConfirmPasswordValid =
        password === confirmPassword && confirmPassword !== "";
      const isFullNameValid = fullName.trim() !== "";
      const isPhoneNumberValid = handleValidPhoneNumber();
      if (
        !isEmailValid ||
        !isPasswordValid ||
        !isConfirmPasswordValid ||
        !isFullNameValid ||
        !isPhoneNumberValid
      ) {
        return;
      }

      const userData = {
        email: email.trim(),
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password.trim(),
      };

      const { accessToken, newUser } = await registerMutation.mutateAsync(
        userData
      );

      handleSetUserInfo({
        ...newUser,
        avatarUrl: newUser.avatarUrl ?? "",
        accessToken,
      });
    } catch (error) {
      console.error("Error during sign up:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [
    email,
    password,
    confirmPassword,
    fullName,
    phoneNumber,
    handleValidateEmail,
    handleValidatePassword,
    // handleSetUserInfo,
    registerMutation,
    handleValidPhoneNumber,
    setIsSubmitting,
    handleShowError
  ]);

  const PasswordRuleSubtext = ({
    isValid,
    text,
  }: {
    isValid: boolean;
    text: string;
  }) => (
    <BaseText
      className={`${isValid ? "text-green-500" : "text-gray-700"} text-sm`}
    >
      {text}
    </BaseText>
  );

  const PasswordRules = ({ rules }: { rules: Partial<PasswordValidType> }) => (
    <View>
      <BaseText className="text-sm text-gray-700">
        {t("auth.password_must")}
      </BaseText>
      <View className="flex-row items-center gap-x-2">
        <AntDesign
          name="checkcircle"
          size={14}
          color={rules.isValidLength ? "#22c55e" : "#6b7280"}
        />
        <BaseText className="text-sm text-gray-700">
          {t("auth.password_rules.length")}
        </BaseText>
      </View>
      <View className="flex-row items-center gap-x-2">
        <AntDesign
          name="checkcircle"
          size={14}
          color={(rules.typesCount ?? 0) >= 2 ? "#22c55e" : "#6b7280"}
        />
        <BaseText className="text-sm text-gray-700">
          {t("auth.password_rules.type")}
        </BaseText>
      </View>
      <View className="pl-4">
        <PasswordRuleSubtext
          isValid={rules.hasUppercase ?? false}
          text={t("auth.password_rules.uppercase")}
        />
        <PasswordRuleSubtext
          isValid={rules.hasLowercase ?? false}
          text={t("auth.password_rules.lowercase")}
        />
        <PasswordRuleSubtext
          isValid={rules.hasNumber ?? false}
          text={t("auth.password_rules.number")}
        />
        <PasswordRuleSubtext
          isValid={rules.hasSpecialChar ?? false}
          text={t("auth.password_rules.special_character")}
        />
      </View>
    </View>
  );

  return (
    <View
      className="flex-1 items-center p-6 gap-y-8"
      style={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
        paddingLeft: insets.left + 24,
        paddingRight: insets.right + 24,
      }}
    >
      <Image
        source={GorollIcon}
        className="h-20 w-32"
        resizeMode="contain"
        alt="Goroll Icon"
      />
      <View className="items-center gap-y-2">
        <Text className="text-3xl font-inter-bold">{t("main.goroll")}</Text>
        <BaseText className="text-gray-600">
          {t("auth.please_enter_details")}
        </BaseText>
      </View>

      <View className="gap-y-6 w-full">
        <View className="gap-y-1.5">
          <FormInput
            label={t("auth.email")}
            placeholder={t("auth.enter_email")}
            value={email}
            onChangeText={(text) => setEmail(text.trim())}
            keyboardType="email-address"
            onError={emailError !== null}
            errorMessage={
              emailError === "EMPTY"
                ? t("auth.please_enter_email")
                : t("auth.invalid_email")
            }
            onBlur={() => isSubmitting && handleValidateEmail()}
            returnKeyType="next"
            onSubmitEditing={() => fullNameRef.current?.focus()}
          />
          <FormInput
            label={t("auth.full_name")}
            placeholder={t("auth.enter_full_name")}
            value={fullName}
            onChangeText={setFullName}
            onError={isSubmitting && !fullName.trim()}
            errorMessage={t("auth.please_enter_full_name")}
            ref={fullNameRef}
            returnKeyType="next"
            onSubmitEditing={() => phoneNumberRef.current?.focus()}
          />
          <FormInput
            label={t("auth.mobile_number")}
            placeholder={t("auth.enter_mobile_number")}
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text.trim())}
            keyboardType="phone-pad"
            maxLength={10}
            onError={phoneNumberError}
            errorMessage={
              phoneNumber === ""
                ? t("auth.please_enter_mobile_number")
                : t("auth.invalid_mobile_number")
            }
            onBlur={() => isSubmitting && handleValidPhoneNumber()}
            ref={phoneNumberRef}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <View className="gap-y-1">
            <FormInput
              label={t("auth.password")}
              placeholder={t("auth.enter_password")}
              value={password}
              onChangeText={(text) => {
                setPassword(text.trim());
                handleValidatePassword(text.trim());
              }}
              rightIcon={() => (
                <Pressable onPress={() => setSeePassword(!seePassword)}>
                  <Feather
                    name={seePassword ? "eye" : "eye-off"}
                    size={20}
                    color="#6b7280"
                  />
                </Pressable>
              )}
              secureTextEntry={seePassword}
              ref={passwordRef}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />
            <PasswordRules rules={passwordValid} />
          </View>
          <FormInput
            label={t("auth.confirm_password")}
            placeholder={t("auth.enter_confirm_password")}
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text.trim())}
            rightIcon={() => (
              <Pressable
                onPress={() => setSeeConfirmPassword(!seeConfirmPassword)}
              >
                <Feather
                  name={seeConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#6b7280"
                />
              </Pressable>
            )}
            secureTextEntry={seeConfirmPassword}
            onError={
              isSubmitting &&
              (password !== confirmPassword || confirmPassword === "")
            }
            errorMessage={confirmPasswordError()}
            ref={confirmPasswordRef}
            returnKeyType="done"
          />
        </View>

        <BaseButton
          className="bg-blue-600 w-full"
          onPress={handleSignUp}
          loading={registerMutation.isPending}
        >
          <BaseText className="text-white text-center">
            {t("auth.sign_up")}
          </BaseText>
        </BaseButton>
      </View>

      <View className="flex-row justify-center items-center gap-x-1">
        <BaseText className="text-gray-600 text-sm">
          {t("auth.already_user")}
        </BaseText>
        <TouchableOpacity
          disabled={registerMutation.isPending}
          onPress={() => navigation.navigate("SignIn")}
        >
          <BaseText className="text-blue-600 text-sm">
            {t("auth.access")}
          </BaseText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
