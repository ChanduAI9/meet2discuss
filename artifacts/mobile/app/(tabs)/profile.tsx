import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useDiscussions } from "@/context/DiscussionsContext";

const C = Colors.light;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { discussions } = useDiscussions();

  if (!user) return null;

  const attended = discussions.filter(
    (d) => d.participants.includes(user.id) && d.hostId !== user.id
  ).length;
  const hosted = discussions.filter((d) => d.hostId === user.id).length;

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
        },
      },
    ]);
  }

  const reputationLevel =
    user.reputationScore >= 100
      ? "Expert"
      : user.reputationScore >= 50
      ? "Advanced"
      : user.reputationScore >= 20
      ? "Established"
      : "Rising";

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
            paddingBottom:
              Platform.OS === "web" ? 34 + 84 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : user.email.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.reputationBadge}>
              <Feather name="star" size={10} color="#F59E0B" />
              <Text style={styles.reputationBadgeText}>{reputationLevel}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name || "Complete Profile"}</Text>
            {user.role && (
              <Text style={styles.role}>{user.role}</Text>
            )}
            {user.company && (
              <Text style={styles.company}>@ {user.company}</Text>
            )}
            {user.yearsExperience && (
              <Text style={styles.experience}>
                {user.yearsExperience} years experience
              </Text>
            )}
          </View>

          <Pressable
            style={styles.editBtn}
            onPress={() => router.push("/(auth)/onboarding")}
          >
            <Feather name="edit-2" size={16} color={C.tint} />
          </Pressable>
        </View>

        {/* Expertise Tags */}
        {user.expertiseTags.length > 0 && (
          <View style={styles.tagsSection}>
            <View style={styles.tagsRow}>
              {user.expertiseTags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bio */}
        {user.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="star"
            value={user.reputationScore.toString()}
            label="Reputation"
            iconColor="#F59E0B"
            bgColor="#FFFBEB"
          />
          <StatCard
            icon="users"
            value={attended.toString()}
            label="Attended"
            iconColor="#4F46E5"
            bgColor="#EEF2FF"
          />
          <StatCard
            icon="mic"
            value={hosted.toString()}
            label="Hosted"
            iconColor="#10B981"
            bgColor="#ECFDF5"
          />
        </View>

        {/* LinkedIn */}
        {user.linkedIn && (
          <Pressable style={styles.linkedInCard}>
            <Feather name="linkedin" size={20} color="#0A66C2" />
            <Text style={styles.linkedInText}>{user.linkedIn}</Text>
            <Feather name="external-link" size={16} color={C.textMuted} />
          </Pressable>
        )}

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Account</Text>

          <SettingsRow
            icon="mail"
            label="Email"
            value={user.email}
          />
          <SettingsRow
            icon="user"
            label="Edit Profile"
            onPress={() => router.push("/(auth)/onboarding")}
            showArrow
          />
          <SettingsRow
            icon="bell"
            label="Notifications"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            showArrow
          />
          <SettingsRow
            icon="shield"
            label="Privacy"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            showArrow
          />
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>About</Text>
          <SettingsRow
            icon="info"
            label="Help & Support"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            showArrow
          />
          <SettingsRow
            icon="file-text"
            label="Terms of Service"
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            showArrow
          />
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color={C.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>Meet2Discuss v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
  iconColor,
  bgColor,
}: {
  icon: string;
  value: string;
  label: string;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <View style={statStyles.card}>
      <View style={[statStyles.iconContainer, { backgroundColor: bgColor }]}>
        <Feather name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showArrow,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        settingStyles.row,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={settingStyles.iconWrap}>
        <Feather name={icon as any} size={16} color={C.textSecondary} />
      </View>
      <Text style={settingStyles.label}>{label}</Text>
      <View style={settingStyles.right}>
        {value && <Text style={settingStyles.value} numberOfLines={1}>{value}</Text>}
        {showArrow && (
          <Feather name="chevron-right" size={16} color={C.textMuted} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  avatarSection: {
    alignItems: "center",
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  reputationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  reputationBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#D97706",
    fontFamily: "Inter_600SemiBold",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  role: {
    fontSize: 14,
    fontWeight: "500",
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  company: {
    fontSize: 13,
    color: C.tint,
    fontFamily: "Inter_500Medium",
  },
  experience: {
    fontSize: 12,
    color: C.textMuted,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.tagBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsSection: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: C.tagBackground,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(79,70,229,0.2)",
  },
  tagText: {
    fontSize: 13,
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
  },
  bioSection: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  bio: {
    fontSize: 14,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  linkedInCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  linkedInText: {
    flex: 1,
    fontSize: 14,
    color: "#0A66C2",
    fontFamily: "Inter_500Medium",
  },
  settingsSection: {
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  settingsSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textMuted,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: C.error,
    fontFamily: "Inter_600SemiBold",
  },
  version: {
    fontSize: 12,
    color: C.textMuted,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 8,
  },
});

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 12,
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
});

const settingStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  iconWrap: {
    width: 28,
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    fontFamily: "Inter_400Regular",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: 160,
  },
  value: {
    fontSize: 13,
    color: C.textMuted,
    fontFamily: "Inter_400Regular",
  },
});
