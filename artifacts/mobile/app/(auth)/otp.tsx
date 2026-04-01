import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 60;
const C = Colors.light;

export default function OtpScreen() {
  const { email, devOtp: initialDevOtp } = useLocalSearchParams<{ email: string; devOtp: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [devOtp, setDevOtp] = useState<string>(initialDevOtp || "");
  const inputRefs = useRef<TextInput[]>([]);
  const insets = useSafeAreaInsets();
  const { verifyOtp, login } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  function handleOtpChange(text: string, index: number) {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "") && newOtp.join("").length === OTP_LENGTH) {
      handleVerify(newOtp.join(""));
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(code?: string) {
    const otpCode = code || otp.join("");
    if (otpCode.length !== OTP_LENGTH) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const success = await verifyOtp(email!, otpCode);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Invalid Code", "The code you entered is incorrect or expired. Please try again.");
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!canResend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newOtp = await login(email!);
    setDevOtp(newOtp);
    setCountdown(RESEND_TIMEOUT);
    setCanResend(false);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  }

  const otpFilled = otp.join("").length === OTP_LENGTH;

  return (
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
              paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={12}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <View style={styles.iconContainer}>
            <Feather name="mail" size={32} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Check your email</Text>
          <Text style={styles.headerSubtitle}>
            We sent a 6-digit code to{"\n"}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </View>
      </LinearGradient>

      <View
        style={[
          styles.body,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 : insets.bottom + 24,
          },
        ]}
      >
        {/* Dev Code Banner */}
        {devOtp ? (
          <Pressable
            style={styles.devBanner}
            onPress={() => {
              const digits = devOtp.split("");
              setOtp(digits);
              handleVerify(devOtp);
            }}
          >
            <Feather name="terminal" size={14} color="#92400E" />
            <View style={styles.devBannerText}>
              <Text style={styles.devBannerLabel}>Your verification code</Text>
              <Text style={styles.devBannerCode}>{devOtp}</Text>
            </View>
            <Text style={styles.devBannerTap}>Tap to fill</Text>
          </Pressable>
        ) : null}

        {/* OTP Inputs */}
        <View style={styles.otpSection}>
          <Text style={styles.otpLabel}>Enter verification code</Text>
          <View style={styles.otpRow}>
            {Array(OTP_LENGTH)
              .fill(null)
              .map((_, i) => (
                <TextInput
                  key={i}
                  ref={(ref) => {
                    if (ref) inputRefs.current[i] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    otp[i] && styles.otpInputFilled,
                  ]}
                  value={otp[i]}
                  onChangeText={(text) => handleOtpChange(text, i)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, i)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                />
              ))}
          </View>
        </View>

        {/* Verify Button */}
        <Pressable
          style={({ pressed }) => [
            styles.verifyBtn,
            !otpFilled && styles.verifyBtnDisabled,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          onPress={() => handleVerify()}
          disabled={!otpFilled || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify & Continue</Text>
          )}
        </Pressable>

        {/* Resend */}
        <View style={styles.resendSection}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {canResend ? (
            <Pressable onPress={handleResend}>
              <Text style={styles.resendLink}>Resend</Text>
            </Pressable>
          ) : (
            <Text style={styles.countdownText}>
              Resend in {countdown}s
            </Text>
          )}
        </View>

        <View style={styles.infoBox}>
          <Feather name="info" size={15} color={C.textMuted} />
          <Text style={styles.infoText}>
            Your code is shown above. It expires in 5 minutes — tap it to fill automatically.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  devBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF3C7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  devBannerText: {
    flex: 1,
  },
  devBannerLabel: {
    fontSize: 11,
    color: "#92400E",
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  devBannerCode: {
    fontSize: 24,
    fontWeight: "700",
    color: "#78350F",
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
    marginTop: 2,
  },
  devBannerTap: {
    fontSize: 12,
    color: "#92400E",
    fontFamily: "Inter_600SemiBold",
    backgroundColor: "#FCD34D",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    paddingBottom: 36,
  },
  headerContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  emailText: {
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  body: {
    flex: 1,
    padding: 24,
    gap: 20,
  },
  otpSection: {
    gap: 16,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: C.text,
    fontFamily: "Inter_500Medium",
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  otpInput: {
    width: 48,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.inputBackground,
    fontSize: 24,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
  },
  otpInputFilled: {
    borderColor: C.tint,
    backgroundColor: C.tagBackground,
    color: C.tint,
  },
  verifyBtn: {
    backgroundColor: C.tint,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBtnDisabled: {
    backgroundColor: C.textMuted,
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  resendSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
  },
  countdownText: {
    fontSize: 14,
    color: C.textMuted,
    fontFamily: "Inter_400Regular",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: C.borderLight,
    borderRadius: 12,
    padding: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
