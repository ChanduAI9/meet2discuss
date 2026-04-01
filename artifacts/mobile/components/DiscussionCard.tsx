import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { Discussion } from "@/context/DiscussionsContext";

const C = Colors.light;

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "AI & Machine Learning": { bg: "#EEF2FF", text: "#4F46E5", dot: "#6366F1" },
  "Web3 & Blockchain": { bg: "#FDF4FF", text: "#9333EA", dot: "#A855F7" },
  "Developer Tools": { bg: "#F0FDF4", text: "#16A34A", dot: "#22C55E" },
  "Startups & Entrepreneurship": { bg: "#FFF7ED", text: "#EA580C", dot: "#F97316" },
  "Design & UX": { bg: "#FFF1F2", text: "#E11D48", dot: "#F43F5E" },
  "Engineering": { bg: "#F0F9FF", text: "#0284C7", dot: "#0EA5E9" },
};

type Props = {
  discussion: Discussion;
  userId?: string;
  onJoin?: (id: string) => void;
  compact?: boolean;
};

export function DiscussionCard({ discussion, userId, onJoin, compact }: Props) {
  const isJoined = userId ? discussion.participants.includes(userId) : false;
  const isHost = userId === discussion.hostId;
  const spotsLeft = discussion.maxParticipants - discussion.participants.length;
  const isFull = spotsLeft <= 0;
  const catStyle = CATEGORY_COLORS[discussion.category] || {
    bg: "#F3F4F6", text: "#374151", dot: "#9CA3AF",
  };

  const dateObj = new Date(discussion.date);
  const dateStr = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/discussion/${discussion.id}`);
  }

  function handleJoin(e: { preventDefault?: () => void }) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onJoin?.(discussion.id);
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
      ]}
      onPress={handlePress}
    >
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
          <View style={[styles.categoryDot, { backgroundColor: catStyle.dot }]} />
          <Text style={[styles.categoryText, { color: catStyle.text }]} numberOfLines={1}>
            {discussion.category}
          </Text>
        </View>
        {discussion.isTrending && (
          <View style={styles.trendingBadge}>
            <Feather name="trending-up" size={10} color="#F59E0B" />
            <Text style={styles.trendingText}>Trending</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {discussion.title}
      </Text>

      {/* Host */}
      <View style={styles.hostRow}>
        <View style={styles.hostAvatar}>
          <Text style={styles.hostAvatarText}>
            {discussion.hostName.charAt(0)}
          </Text>
        </View>
        <View style={styles.hostInfo}>
          <Text style={styles.hostName}>{discussion.hostName}</Text>
          <Text style={styles.hostRole} numberOfLines={1}>{discussion.hostRole}</Text>
        </View>
        <View style={styles.reputationBadge}>
          <Feather name="star" size={12} color="#F59E0B" />
          <Text style={styles.reputationText}>{discussion.hostReputation}</Text>
        </View>
      </View>

      {/* Meta */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={13} color={C.textMuted} />
          <Text style={styles.metaText}>{dateStr} · {discussion.time}</Text>
        </View>
        <View style={styles.metaItem}>
          {discussion.isOnline ? (
            <Feather name="video" size={13} color={C.textMuted} />
          ) : (
            <Feather name="map-pin" size={13} color={C.textMuted} />
          )}
          <Text style={styles.metaText} numberOfLines={1}>
            {discussion.isOnline ? "Online" : discussion.location}
          </Text>
        </View>
      </View>

      {/* Topics */}
      {!compact && discussion.topics.length > 0 && (
        <View style={styles.topicsRow}>
          {discussion.topics.slice(0, 3).map((topic) => (
            <View key={topic} style={styles.topicChip}>
              <Text style={styles.topicText}>{topic}</Text>
            </View>
          ))}
          {discussion.topics.length > 3 && (
            <Text style={styles.topicMore}>+{discussion.topics.length - 3}</Text>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.participantsInfo}>
          <View style={styles.avatarStack}>
            {discussion.participants.slice(0, 3).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.miniAvatar,
                  { marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i },
                ]}
              />
            ))}
          </View>
          <Text style={styles.participantsText}>
            {discussion.participants.length}/{discussion.maxParticipants}
          </Text>
          {spotsLeft > 0 && spotsLeft <= 5 && (
            <Text style={styles.urgentText}>{spotsLeft} spots left!</Text>
          )}
        </View>

        {!isHost && (
          <Pressable
            style={({ pressed }) => [
              styles.joinBtn,
              isJoined && styles.joinBtnJoined,
              isFull && !isJoined && styles.joinBtnFull,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleJoin}
            disabled={isFull && !isJoined}
          >
            <Text
              style={[
                styles.joinBtnText,
                isJoined && styles.joinBtnTextJoined,
                isFull && !isJoined && styles.joinBtnTextFull,
              ]}
            >
              {isJoined ? "Joined" : isFull ? "Full" : "Join"}
            </Text>
          </Pressable>
        )}
        {isHost && (
          <View style={styles.hostBadgeFooter}>
            <Feather name="shield" size={12} color={C.tint} />
            <Text style={styles.hostBadgeText}>Host</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: C.borderLight,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    maxWidth: "70%",
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  trendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  trendingText: {
    fontSize: 11,
    color: "#F59E0B",
    fontFamily: "Inter_600SemiBold",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  hostAvatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    fontFamily: "Inter_600SemiBold",
  },
  hostRole: {
    fontSize: 12,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  reputationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  reputationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D97706",
    fontFamily: "Inter_600SemiBold",
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  topicsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  topicChip: {
    backgroundColor: C.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  topicText: {
    fontSize: 12,
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  topicMore: {
    fontSize: 12,
    color: C.textMuted,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarStack: {
    flexDirection: "row",
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.tintLight,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  participantsText: {
    fontSize: 13,
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  urgentText: {
    fontSize: 12,
    color: C.error,
    fontFamily: "Inter_600SemiBold",
  },
  joinBtn: {
    backgroundColor: C.tint,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinBtnJoined: {
    backgroundColor: C.tagBackground,
    borderWidth: 1,
    borderColor: C.tint,
  },
  joinBtnFull: {
    backgroundColor: C.borderLight,
  },
  joinBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  joinBtnTextJoined: {
    color: C.tint,
  },
  joinBtnTextFull: {
    color: C.textMuted,
  },
  hostBadgeFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.tagBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  hostBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
  },
});
