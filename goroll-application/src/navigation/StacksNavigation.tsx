import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/auth/AuthContext";
import { RootTabs } from "./TabsNavigation";
import { useAppContext } from "../contexts/app/AppContext";
import { useTranslation } from "react-i18next";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useRecordingStore } from "../stores/recordingStore";

import AuthLayout from "../layouts/AuthLayout";
import HeaderLayout from "../layouts/HeaderLayout";

import AppSplashScreen from "../screens/AppSplashScreen";
import SignInScreen from "../screens/Auth/SignInScreen";
import SignUpScreen from "../screens/Auth/SignUpScreen";
import SettingScreen from "../screens/Setting/SettingScreen";
import EditProfileScreen from "../screens/Profile/EditProfileScreen";
import LocationDetailScreen from "../screens/Location/LocationDetailScreen";
import LocationReviewsScreen from "../screens/Location/LocationReviewsScreen";
import LocationReviewsByTypeScreen from "../screens/Location/LocationReviewsByTypeScreen";
import LocationUserReviewsScreen from "../screens/Location/LocationUserReviewsScreen";
import CreateObstacleScreen from "../screens/Obstacle/CreateObstacleScreen";
import CreatePostScreen from "../screens/Post/CreatePostScreen";
import CommunityDetailScreen from "../screens/Community/CommunityDetailScreen";
import LocationAddImageScreen from "../screens/Location/LocationAddImageScreen";
import PostScreen from "../screens/Post/PostScreen";

import type { RootStacksParamList } from "./NavigationTypes";
import CreateRouteScreen from "../screens/Route/CreateRouteScreen";
import RouteDetailScreen from "../screens/Route/RouteDetailScreen";
import RouteScreen from "../screens/Route/RouteScreen";
import EditPostScreen from "../screens/Post/EditPostScreen";
import ForgotPasswordScreen from "../screens/ForgotPassword/ForgotPasswordScreen";
import ResetPasswordSuccessScreen from "../screens/ForgotPassword/ResetPasswordSuccessScreen";
import SearchRouteScreen from "../screens/Search/SearchRouteScreen";
import SearchLocationScreen from "../screens/Search/SearchLocationScreen";
import SearchObstacleScreen from "../screens/Search/SearchObstacleScreen";
import ObstacleDetailScreen from "../screens/Obstacle/ObstacleDetailScreen";
import OfflineScreen from "../screens/OfflineScreen";
import LocationImageByTypeScreen from "../screens/ImageViewScreen";
// import { NotFound } from "../screens/NotFound";

const Stack = createNativeStackNavigator<RootStacksParamList>();

export function RootStacks() {
  const { t } = useTranslation();
  const { isLoading, isSignIn } = useAuth();
  const { fontFamily, showCreate, setShowCreate,haveInternet } = useAppContext();
  const { isRecording, setIsRecording } = useRecordingStore();

  if (isLoading) {
    return <AppSplashScreen />;
  } else if (!isLoading && !haveInternet) {
    return (
      <OfflineScreen />
    )
  }
  
  return (
    <NavigationContainer
      onReady={() => SplashScreen.hideAsync()}
      onStateChange={() => {
        if (showCreate) setShowCreate(false);
        // if (isRecording) setIsRecording(false);
      }}
    >
      <Stack.Navigator
        // initialRouteName="NotFound"
        screenOptions={{
          headerShown: false,
          headerTitleStyle: {
            fontFamily: fontFamily(),
          },
        }}
      >
        {isSignIn ? (
          <Stack.Group>
            <Stack.Screen
              name="HomeTabs"
              component={RootTabs}
              options={{
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="Setting"
              options={{
                animation: "slide_from_right",
              }}
            >
              {() => (
                <HeaderLayout headerTitle={t("main.setting")}>
                  <SettingScreen />
                </HeaderLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="LocationDetail"
              component={LocationDetailScreen}
              options={{
                headerShown: false,
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="SearchLocationDetail"
              component={LocationDetailScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="LocationReviews"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              {() => (
                <HeaderLayout headerTitle={t("review.written_review")}>
                  <LocationReviewsScreen />
                </HeaderLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="LocationReviewsByType"
              component={LocationReviewsByTypeScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="LocationUserReviews"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              {() => (
                <HeaderLayout headerTitle={t("review.review")}>
                  <LocationUserReviewsScreen />
                </HeaderLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="CreateObstacle"
              component={CreateObstacleScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CreateRoute"
              component={CreateRouteScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CreatePost"
              component={CreatePostScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="CommunityDetail"
              component={CommunityDetailScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="PostDetail"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              {() => <CommunityDetailScreen manageAction />}
            </Stack.Screen>
            <Stack.Screen
              name="LocationAddImage"
              component={LocationAddImageScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="RouteDetail"
              options={{
                headerShown: false,
              }}
              component={RouteDetailScreen}
            />
            <Stack.Screen
              name="RouteScreen"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              {() => (
                <HeaderLayout headerTitle={t("profile.route_lib")}>
                  <RouteScreen />
                </HeaderLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="PostScreen"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              {() => (
                <HeaderLayout headerTitle={t("profile.my_post")}>
                  <PostScreen />
                </HeaderLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="EditPost"
              component={EditPostScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="SearchRoute"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              {() => (
                <HeaderLayout headerTitle={t("main.routes")}>
                  <SearchRouteScreen />
                </HeaderLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="SearchLocation"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              {() => (
                <HeaderLayout headerTitle={t("main.locations")}>
                  <SearchLocationScreen />
                </HeaderLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="SearchObstacle"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              {() => (
                <HeaderLayout headerTitle={t("main.obstacles")}>
                  <SearchObstacleScreen />
                </HeaderLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="ObstacleDetail"
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            >
              {() => (
                <HeaderLayout headerTitle={t("obstacle.obstacle_reported")}>
                  <ObstacleDetailScreen />
                </HeaderLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="ImagePreview"
              options={{
                headerShown: false,
                animation: "fade"
              }}
              component={LocationImageByTypeScreen}
            />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen
              name="SignIn"
              options={{
                animation: "slide_from_left",
                gestureEnabled: false,
                animationDuration: 300,
              }}
            >
              {() => (
                <AuthLayout>
                  <SignInScreen />
                </AuthLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="SignUp"
              options={{
                animation: "slide_from_right",
                gestureEnabled: false,
              }}
            >
              {() => (
                <AuthLayout>
                  <SignUpScreen />
                </AuthLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{
                animation: "slide_from_right",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ResetSuccess"
              component={ResetPasswordSuccessScreen}
              options={{
                animation: "slide_from_right",
                headerShown: false,
              }}
            />
          </Stack.Group>
        )}
        {/* <Stack.Screen name="NotFound" component={NotFound} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
