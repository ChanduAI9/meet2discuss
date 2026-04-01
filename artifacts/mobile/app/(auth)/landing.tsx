import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

const FEATURES = [
  {
    icon: "users" as const,
    title: "Meet Builders",
    desc: "Connect with like-minded tech professionals",
  },
  {
    icon: "message-circle" as const,
    title: "Structured Discussions",
    desc: "Focused conversations that drive real outcomes",
  },
  {
    icon: "star" as const,
    title: "Build Reputation",
    desc: "Earn recognition for your contributions",
  },
];

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const C = Colors.light;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4F46E5", "#6366F1", "#7C3AED"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 24,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & Brand */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Feather name="message-square" size={36} color="#fff" />
          </View>
          <Text style={styles.brandName}>Meet2Discuss</Text>
          <Text style={styles.tagline}>For Technology Builders</Text>
        </View>

        {/* Headline */}
        <View style={styles.headlineSection}>
          <Text style={styles.headline}>
            Meet builders.{"\n"}Discuss ideas.{"\n"}Build together.
          </Text>
          <Text style={styles.subtitle}>
            Join structured discussions with tech professionals who share your
            passion for building.
          </Text>
        </View>

        {/* Feature Pills */}
        <View style={styles.featuresSection}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Feather name={f.icon} size={20} color="#fff" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { val: "2.4K+", label: "Builders" },
            { val: "180+", label: "Discussions" },
            { val: "94%", label: "Satisfaction" },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.val}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#4F46E5" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4F46E5",
  },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_500Medium",
    marginTop: 2,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headlineSection: {
    marginBottom: 36,
  },
  headline: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "Inter_700Bold",
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
  },
  featuresSection: {
    gap: 12,
    marginBottom: 36,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  ctaSection: {
    gap: 12,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#4F46E5",
    fontFamily: "Inter_700Bold",
  },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  disclaimer: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
