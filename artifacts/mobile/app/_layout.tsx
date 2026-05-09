import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DiscussionsProvider } from "@/context/DiscussionsContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function injectWebFonts() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  if (document.getElementById("m2d-font-fix")) return;

  const style = document.createElement("style");
  style.id = "m2d-font-fix";
  style.textContent = `
    /* Load Inter from Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* Map Expo font names → Inter (with system-ui fallback) */
    @font-face {
      font-family: 'Inter_400Regular';
      src: local('Inter'), local('Inter Regular');
      font-weight: 400;
      font-display: swap;
    }
    @font-face {
      font-family: 'Inter_500Medium';
      src: local('Inter Medium'), local('Inter');
      font-weight: 500;
      font-display: swap;
    }
    @font-face {
      font-family: 'Inter_600SemiBold';
      src: local('Inter SemiBold'), local('Inter');
      font-weight: 600;
      font-display: swap;
    }
    @font-face {
      font-family: 'Inter_700Bold';
      src: local('Inter Bold'), local('Inter');
      font-weight: 700;
      font-display: swap;
    }

    /* Ensure text is always visible — fallback to system font stack */
    body, #root {
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    /* Override unresolved Expo font family names to system stack */
    [style*="Inter_400Regular"],
    [style*="Inter_500Medium"],
    [style*="Inter_600SemiBold"],
    [style*="Inter_700Bold"] {
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }

    /* Expo Vector Icons font loading */
    @font-face {
      font-family: 'Feather';
      src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.4/build/vendor/react-native-vector-icons/Fonts/Feather.ttf') format('truetype');
      font-display: swap;
    }
    @font-face {
      font-family: 'Ionicons';
      src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.4/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
      font-display: swap;
    }
    @font-face {
      font-family: 'MaterialIcons';
      src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.4/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf') format('truetype');
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

function RootLayoutNav() {
  const { user, isLoading, isOnboarded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/landing");
    } else if (user && !isOnboarded && segments[1] !== "onboarding") {
      router.replace("/(auth)/onboarding");
    } else if (user && isOnboarded && inAuthGroup && segments[1] !== "onboarding") {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, isOnboarded, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="discussion/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    injectWebFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const content = (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <DiscussionsProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </DiscussionsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );

  if (Platform.OS === "web") {
    return content;
  }

  return <KeyboardProvider>{content}</KeyboardProvider>;
}
