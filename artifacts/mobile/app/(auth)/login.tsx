import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const C = Colors.light;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSendOtp() {
    if (!isValidEmail) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const devOtp = await login(email);
      router.push({
        pathname: "/(auth)/otp",
        params: { email, devOtp },
      });
    } catch (e) {
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={["#4F46E5", "#6366F1"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View
            style={[
              styles.headerContent,
              {
                paddingTop:
                  Platform.OS === "web" ? 67 : insets.top + 16,
              },
            ]}
          >
            <Pressable
              onPress={() => router.back()}
              style={styles.backBtn}
              hitSlop={12}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View style={styles.headerTitle}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.headerSubtitle}>
                Sign in to your Meet2Discuss account
              </Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.body}
          contentContainerStyle={[
            styles.bodyContent,
            { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Email OTP Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sign in with Email</Text>
            <Text style={styles.sectionDesc}>
              We'll send a 6-digit code to your email
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Feather name="mail" size={20} color={C.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor={C.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
              />
              {email.length > 0 && (
                <Pressable onPress={() => setEmail("")} hitSlop={8}>
                  <Feather name="x-circle" size={18} color={C.textMuted} />
                </Pressable>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.sendOtpBtn,
                !isValidEmail && styles.sendOtpBtnDisabled,
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed && isValidEmail ? 0.98 : 1 }],
                },
              ]}
              onPress={handleSendOtp}
              disabled={!isValidEmail || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.sendOtpBtnText}>Send Code</Text>
                  <Feather name="send" size={18} color="#fff" />
                </>
              )}
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login */}
          <Pressable
            style={({ pressed }) => [
              styles.googleBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() =>
              Alert.alert(
                "Google Login",
                "Google authentication requires Supabase configuration."
              )
            }
          >
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </Pressable>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Feather name="shield" size={16} color={C.tint} />
            <Text style={styles.infoText}>
              We use secure, passwordless authentication. OTP codes expire in 5
              minutes.
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingBottom: 32,
  },
  headerContent: {
    paddingHorizontal: 24,
    gap: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    gap: 6,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    fontFamily: "Inter_600SemiBold",
  },
  sectionDesc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.inputBackground,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    gap: 10,
  },
  inputIcon: {
    width: 24,
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    fontFamily: "Inter_400Regular",
  },
  sendOtpBtn: {
    backgroundColor: Colors.light.tint,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  sendOtpBtnDisabled: {
    backgroundColor: Colors.light.textMuted,
  },
  sendOtpBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.light.textMuted,
    fontFamily: "Inter_400Regular",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 16,
    backgroundColor: Colors.light.card,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    fontFamily: "Inter_500Medium",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.light.tagBackground,
    borderRadius: 12,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.tint,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
