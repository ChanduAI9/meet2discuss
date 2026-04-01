import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
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

const COVER_COLORS: Record<string, [string, string]> = {
  ai: ["#4F46E5", "#7C3AED"],
  web3: ["#7C3AED", "#9333EA"],
  devtools: ["#059669", "#10B981"],
  startup: ["#D97706", "#F59E0B"],
  design: ["#E11D48", "#F43F5E"],
  platform: ["#0284C7", "#0EA5E9"],
  custom: ["#4F46E5", "#6366F1"],
};

const LOCATION_LABELS = {
  online: "Online",
  offline: "In Person",
  hybrid: "Hybrid",
};

export default function DiscussionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getDiscussion, joinDiscussion, leaveDiscussion, getUserStatus, promoteFromWaitingList, removeParticipant } = useDiscussions();
  const [isJoining, setIsJoining] = useState(false);

  const discussion = getDiscussion(id!);

  if (!discussion) {
    return (
      <View style={styles.notFound}>
        <Feather name="alert-circle" size={48} color={C.textMuted} />
        <Text style={styles.notFoundText}>Discussion not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn2}>
          <Text style={styles.backBtn2Text}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const userStatus = user ? getUserStatus(discussion.id, user.id) : "none";
  const isHost = userStatus === "host";
  const isConfirmed = userStatus === "confirmed";
  const isWaiting = userStatus === "waiting";
  const isJoined = isConfirmed || isWaiting;

  const confirmedCount = discussion.participants.length;
  const waitingCount = discussion.waitingList.length;
  const spotsLeft = discussion.maxParticipants - confirmedCount;
  const isFull = spotsLeft <= 0;
  const coverColors = COVER_COLORS[discussion.coverImage] || COVER_COLORS.custom;

  const dateObj = new Date(discussion.date);
  const fullDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleJoinLeave() {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isJoined) {
      Alert.alert(
        isWaiting ? "Leave Waiting List" : "Leave Discussion",
        isWaiting
          ? "Are you sure you want to leave the waiting list?"
          : "Are you sure you want to leave this discussion?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
            onPress: async () => {
              setIsJoining(true);
              try {
                await leaveDiscussion(discussion.id, user.id);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              } finally {
                setIsJoining(false);
              }
            },
          },
        ]
      );
    } else {
      setIsJoining(true);
      try {
        const result = await joinDiscussion(discussion.id, user.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (result === "waiting") {
          Alert.alert(
            "Added to Waiting List",
            "This discussion is full. You've been added to the waiting list. We'll notify you if a spot opens up!"
          );
        }
      } finally {
        setIsJoining(false);
      }
    }
  }

  function handleOpenLink(url?: string) {
    if (!url) return;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open link."));
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Cover */}
        <View style={[styles.hero, { backgroundColor: coverColors[0] }]}>
          <View
            style={[
              styles.heroNav,
              { paddingTop: Platform.OS === "web" ? 67 : insets.top + 12 },
            ]}
          >
            <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <Pressable style={styles.shareBtn} hitSlop={8}>
              <Feather name="share" size={20} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.heroBadges}>
            <View style={styles.heroCategoryBadge}>
              <Text style={styles.heroCategoryText}>{discussion.category}</Text>
            </View>
            <View style={styles.heroLocationBadge}>
              <Feather
                name={discussion.locationType === "online" ? "video" : discussion.locationType === "hybrid" ? "shuffle" : "map-pin"}
                size={11}
                color="rgba(255,255,255,0.9)"
              />
              <Text style={styles.heroLocationText}>{LOCATION_LABELS[discussion.locationType]}</Text>
            </View>
            {discussion.isTrending && (
              <View style={styles.heroTrendingBadge}>
                <Feather name="trending-up" size={12} color="#F59E0B" />
                <Text style={styles.heroTrendingText}>Trending</Text>
              </View>
            )}
          </View>

          <Text style={styles.heroTitle}>{discussion.title}</Text>

          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Feather name="calendar" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroMetaText}>{discussion.time}</Text>
            </View>
            <View style={styles.heroMetaDot} />
            {/* Capacity pill */}
            <View style={[styles.capacityPill, isFull && styles.capacityPillFull]}>
              <Feather name="users" size={12} color={isFull ? "#FCD34D" : "rgba(255,255,255,0.9)"} />
              <Text style={[styles.capacityText, isFull && styles.capacityTextFull]}>
                {confirmedCount}/{discussion.maxParticipants}
                {isFull ? " · Full" : spotsLeft <= 3 ? ` · ${spotsLeft} left` : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* User Status Banner */}
        {isConfirmed && (
          <View style={[styles.statusBanner, styles.statusBannerConfirmed]}>
            <Feather name="check-circle" size={16} color="#059669" />
            <Text style={styles.statusBannerTextConfirmed}>You are confirmed for this discussion</Text>
          </View>
        )}
        {isWaiting && (
          <View style={[styles.statusBanner, styles.statusBannerWaiting]}>
            <Feather name="clock" size={16} color="#D97706" />
            <Text style={styles.statusBannerTextWaiting}>
              You are #{(discussion.waitingList.indexOf(user?.id || "") + 1)} on the waiting list
            </Text>
          </View>
        )}
        {isHost && (
          <View style={[styles.statusBanner, styles.statusBannerHost]}>
            <Feather name="star" size={16} color={C.tint} />
            <Text style={styles.statusBannerTextHost}>You are hosting this discussion</Text>
          </View>
        )}

        {/* Host */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Host</Text>
          <View style={styles.hostCard}>
            <View style={styles.hostAvatar}>
              <Text style={styles.hostAvatarText}>{discussion.hostName.charAt(0)}</Text>
            </View>
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>{discussion.hostName}</Text>
              <Text style={styles.hostRole}>{discussion.hostRole}</Text>
            </View>
            <View style={styles.hostReputation}>
              <Feather name="star" size={14} color="#F59E0B" />
              <Text style={styles.hostReputationText}>{discussion.hostReputation}</Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsCard}>
            <DetailRow icon="calendar" label="Date" value={fullDate} />
            <DetailRow icon="clock" label="Time" value={`${discussion.time} · ${discussion.duration} minutes`} />
            <DetailRow
              icon="users"
              label="Capacity"
              value={`${confirmedCount}/${discussion.maxParticipants} confirmed${waitingCount > 0 ? ` · ${waitingCount} waiting` : ""}`}
              valueColor={isFull ? C.error : spotsLeft <= 3 ? "#D97706" : undefined}
            />
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationCard}>
            <View style={[styles.locationTypePill, {
              backgroundColor: discussion.locationType === "online" ? "#EEF2FF" : discussion.locationType === "offline" ? "#F0FDF4" : "#FFF7ED"
            }]}>
              <Feather
                name={discussion.locationType === "online" ? "video" : discussion.locationType === "offline" ? "map-pin" : "shuffle"}
                size={14}
                color={discussion.locationType === "online" ? C.tint : discussion.locationType === "offline" ? "#059669" : "#D97706"}
              />
              <Text style={[styles.locationTypePillText, {
                color: discussion.locationType === "online" ? C.tint : discussion.locationType === "offline" ? "#059669" : "#D97706"
              }]}>
                {LOCATION_LABELS[discussion.locationType]}
              </Text>
            </View>

            {(discussion.locationType === "online" || discussion.locationType === "hybrid") && discussion.meetingLink && (
              <Pressable
                style={styles.locationLinkRow}
                onPress={() => handleOpenLink(discussion.meetingLink)}
              >
                <Feather name="video" size={16} color={C.tint} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationLinkLabel}>Meeting Link</Text>
                  <Text style={styles.locationLinkValue} numberOfLines={1}>{discussion.meetingLink}</Text>
                </View>
                <Feather name="external-link" size={14} color={C.tint} />
              </Pressable>
            )}

            {(discussion.locationType === "offline" || discussion.locationType === "hybrid") && (
              <View style={styles.locationVenueBlock}>
                {discussion.locationType === "hybrid" && (
                  <View style={styles.locationDivider}>
                    <View style={styles.locationDividerLine} />
                    <Text style={styles.locationDividerLabel}>Venue</Text>
                    <View style={styles.locationDividerLine} />
                  </View>
                )}
                {discussion.venueName && (
                  <View style={styles.locationDetailRow}>
                    <Feather name="home" size={14} color={C.textSecondary} />
                    <Text style={styles.locationDetailText}>{discussion.venueName}</Text>
                  </View>
                )}
                {discussion.venueAddress && (
                  <View style={styles.locationDetailRow}>
                    <Feather name="map-pin" size={14} color={C.textSecondary} />
                    <Text style={styles.locationDetailText}>
                      {discussion.venueAddress}{discussion.city ? `, ${discussion.city}` : ""}
                    </Text>
                  </View>
                )}
                {!discussion.venueAddress && discussion.city && (
                  <View style={styles.locationDetailRow}>
                    <Feather name="map-pin" size={14} color={C.textSecondary} />
                    <Text style={styles.locationDetailText}>{discussion.city}</Text>
                  </View>
                )}
                {discussion.mapsLink && (
                  <Pressable
                    style={styles.mapsBtn}
                    onPress={() => handleOpenLink(discussion.mapsLink)}
                  >
                    <Feather name="navigation" size={14} color={C.tint} />
                    <Text style={styles.mapsBtnText}>Open in Maps</Text>
                    <Feather name="external-link" size={12} color={C.tint} />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{discussion.description}</Text>
        </View>

        {/* Topics */}
        {discussion.topics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Topics</Text>
            <View style={styles.topicsRow}>
              {discussion.topics.map((topic) => (
                <View key={topic} style={styles.topicChip}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Confirmed Participants */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Confirmed Participants</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{confirmedCount}</Text>
            </View>
          </View>
          <View style={styles.participantsGrid}>
            {discussion.participants.slice(0, 10).map((p, i) => (
              <View key={p} style={styles.participantItem}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>
                    {String.fromCharCode(65 + (i % 26))}
                  </Text>
                </View>
                {isHost && p !== discussion.hostId && (
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() =>
                      Alert.alert("Remove Participant", "Remove this participant?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Remove", style: "destructive", onPress: () => removeParticipant(discussion.id, p) },
                      ])
                    }
                  >
                    <Feather name="x" size={10} color="#fff" />
                  </Pressable>
                )}
              </View>
            ))}
            {confirmedCount > 10 && (
              <View style={[styles.participantAvatar, styles.participantMore]}>
                <Text style={styles.participantMoreText}>+{confirmedCount - 10}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Waiting List */}
        {waitingCount > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Waiting List</Text>
              <View style={[styles.countBadge, styles.countBadgeWaiting]}>
                <Text style={[styles.countBadgeText, styles.countBadgeTextWaiting]}>{waitingCount}</Text>
              </View>
            </View>
            <View style={styles.waitingListCard}>
              {discussion.waitingList.slice(0, 6).map((p, i) => (
                <View key={p} style={styles.waitingListRow}>
                  <View style={styles.waitingRank}>
                    <Text style={styles.waitingRankText}>#{i + 1}</Text>
                  </View>
                  <View style={styles.waitingAvatar}>
                    <Text style={styles.waitingAvatarText}>{String.fromCharCode(65 + (i % 26))}</Text>
                  </View>
                  <Text style={styles.waitingName}>Participant {i + 1}</Text>
                  <View style={styles.waitingBadge}>
                    <Text style={styles.waitingBadgeText}>Waiting</Text>
                  </View>
                  {isHost && (
                    <Pressable
                      style={styles.promoteBtn}
                      onPress={() =>
                        Alert.alert("Promote", "Promote this person to confirmed?", [
                          { text: "Cancel", style: "cancel" },
                          { text: "Promote", onPress: () => promoteFromWaitingList(discussion.id, p) },
                        ])
                      }
                    >
                      <Feather name="arrow-up" size={14} color={C.tint} />
                    </Pressable>
                  )}
                </View>
              ))}
              {waitingCount > 6 && (
                <Text style={styles.waitingMoreText}>+{waitingCount - 6} more on waiting list</Text>
              )}
            </View>
          </View>
        )}

        {/* Chat Access */}
        {(isJoined || isHost) && (
          <Pressable
            style={({ pressed }) => [styles.chatAccessCard, { opacity: pressed ? 0.9 : 1 }]}
            onPress={() => router.push(`/chat/${discussion.id}`)}
          >
            <View style={styles.chatAccessIcon}>
              <Feather name="message-circle" size={24} color={C.tint} />
            </View>
            <View style={styles.chatAccessInfo}>
              <Text style={styles.chatAccessTitle}>Open Discussion Chat</Text>
              <Text style={styles.chatAccessDesc}>Chat with participants before and during</Text>
            </View>
            <Feather name="chevron-right" size={20} color={C.textMuted} />
          </Pressable>
        )}
      </ScrollView>

      {/* Footer CTA */}
      {!isHost && (
        <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
          {isConfirmed ? (
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, styles.ctaBtnJoined, { opacity: pressed ? 0.9 : 1 }]}
              onPress={handleJoinLeave}
              disabled={isJoining}
            >
              <Feather name="user-check" size={20} color={C.tint} />
              <View>
                <Text style={styles.ctaBtnTextJoined}>Leave Discussion</Text>
                <Text style={styles.ctaBtnSubtext}>You are confirmed</Text>
              </View>
            </Pressable>
          ) : isWaiting ? (
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, styles.ctaBtnWaiting, { opacity: pressed ? 0.9 : 1 }]}
              onPress={handleJoinLeave}
              disabled={isJoining}
            >
              <Feather name="clock" size={20} color="#D97706" />
              <View>
                <Text style={styles.ctaBtnTextWaiting}>Leave Waiting List</Text>
                <Text style={[styles.ctaBtnSubtext, { color: "#D97706" }]}>
                  #{discussion.waitingList.indexOf(user?.id || "") + 1} in queue
                </Text>
              </View>
            </Pressable>
          ) : isFull ? (
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, styles.ctaBtnWaitlist, { opacity: pressed ? 0.9 : 1 }]}
              onPress={handleJoinLeave}
              disabled={isJoining}
            >
              <Feather name="clock" size={20} color="#fff" />
              <Text style={styles.ctaBtnText}>Join Waiting List</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
              onPress={handleJoinLeave}
              disabled={isJoining}
            >
              <Feather name="user-plus" size={20} color="#fff" />
              <Text style={styles.ctaBtnText}>Join Discussion</Text>
            </Pressable>
          )}
        </View>
      )}

      {isHost && (
        <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
          <Pressable
            style={[styles.ctaBtn]}
            onPress={() => router.push(`/chat/${discussion.id}`)}
          >
            <Feather name="message-circle" size={20} color="#fff" />
            <Text style={styles.ctaBtnText}>Open Chat (Host)</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function DetailRow({ icon, label, value, valueColor }: {
  icon: string; label: string; value: string; valueColor?: string;
}) {
  return (
    <View style={detailStyles.row}>
      <View style={detailStyles.iconWrap}>
        <Feather name={icon as any} size={16} color={C.tint} />
      </View>
      <View style={detailStyles.content}>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={[detailStyles.value, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  scroll: { flex: 1 },
  content: { gap: 0 },
  hero: { padding: 20, paddingBottom: 28, gap: 12 },
  heroNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.2)", alignItems: "center", justifyContent: "center" },
  shareBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.2)", alignItems: "center", justifyContent: "center" },
  heroBadges: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  heroCategoryBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  heroCategoryText: { fontSize: 12, fontWeight: "600", color: "#fff", fontFamily: "Inter_600SemiBold" },
  heroLocationBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  heroLocationText: { fontSize: 11, color: "rgba(255,255,255,0.9)", fontFamily: "Inter_600SemiBold" },
  heroTrendingBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(245,158,11,0.2)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  heroTrendingText: { fontSize: 12, fontWeight: "600", color: "#FCD34D", fontFamily: "Inter_600SemiBold" },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#fff", fontFamily: "Inter_700Bold", lineHeight: 34, letterSpacing: -0.5 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  heroMetaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroMetaText: { fontSize: 13, color: "rgba(255,255,255,0.9)", fontFamily: "Inter_500Medium" },
  heroMetaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.5)" },
  capacityPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  capacityPillFull: { backgroundColor: "rgba(245,158,11,0.25)" },
  capacityText: { fontSize: 12, color: "rgba(255,255,255,0.9)", fontFamily: "Inter_600SemiBold" },
  capacityTextFull: { color: "#FCD34D" },
  statusBanner: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 12, marginBottom: 0 },
  statusBannerConfirmed: { backgroundColor: "#F0FDF4", borderBottomWidth: 1, borderBottomColor: "#BBF7D0" },
  statusBannerWaiting: { backgroundColor: "#FFFBEB", borderBottomWidth: 1, borderBottomColor: "#FDE68A" },
  statusBannerHost: { backgroundColor: "#EEF2FF", borderBottomWidth: 1, borderBottomColor: "#C7D2FE" },
  statusBannerTextConfirmed: { fontSize: 14, fontWeight: "600", color: "#059669", fontFamily: "Inter_600SemiBold" },
  statusBannerTextWaiting: { fontSize: 14, fontWeight: "600", color: "#D97706", fontFamily: "Inter_600SemiBold" },
  statusBannerTextHost: { fontSize: 14, fontWeight: "600", color: C.tint, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.text, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  countBadge: { backgroundColor: C.tint, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countBadgeWaiting: { backgroundColor: "#FEF3C7" },
  countBadgeText: { fontSize: 12, color: "#fff", fontFamily: "Inter_700Bold" },
  countBadgeTextWaiting: { color: "#92400E" },
  hostCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.borderLight },
  hostAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.tint, alignItems: "center", justifyContent: "center" },
  hostAvatarText: { fontSize: 20, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  hostInfo: { flex: 1 },
  hostName: { fontSize: 16, fontWeight: "600", color: C.text, fontFamily: "Inter_600SemiBold" },
  hostRole: { fontSize: 13, color: C.textSecondary, fontFamily: "Inter_400Regular", marginTop: 2 },
  hostReputation: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFFBEB", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  hostReputationText: { fontSize: 13, fontWeight: "600", color: "#D97706", fontFamily: "Inter_600SemiBold" },
  detailsCard: { backgroundColor: C.card, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.borderLight },
  locationCard: { backgroundColor: C.card, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.borderLight, padding: 14, gap: 12 },
  locationTypePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start" },
  locationTypePillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  locationLinkRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.tagBackground, borderRadius: 12, padding: 12 },
  locationLinkLabel: { fontSize: 11, color: C.textMuted, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.4 },
  locationLinkValue: { fontSize: 13, color: C.tint, fontFamily: "Inter_500Medium", marginTop: 1 },
  locationVenueBlock: { gap: 8 },
  locationDivider: { flexDirection: "row", alignItems: "center", gap: 8 },
  locationDividerLine: { flex: 1, height: 1, backgroundColor: C.borderLight },
  locationDividerLabel: { fontSize: 11, color: C.textMuted, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.4 },
  locationDetailRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  locationDetailText: { flex: 1, fontSize: 14, color: C.text, fontFamily: "Inter_400Regular", lineHeight: 20 },
  mapsBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.tagBackground, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignSelf: "flex-start" },
  mapsBtnText: { fontSize: 13, color: C.tint, fontFamily: "Inter_600SemiBold" },
  description: { fontSize: 15, color: C.textSecondary, fontFamily: "Inter_400Regular", lineHeight: 24 },
  topicsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  topicChip: { backgroundColor: C.tagBackground, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "rgba(79,70,229,0.2)" },
  topicText: { fontSize: 13, color: C.tint, fontFamily: "Inter_600SemiBold" },
  participantsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  participantItem: { position: "relative" },
  participantAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.tintLight, alignItems: "center", justifyContent: "center" },
  participantAvatarText: { fontSize: 16, fontWeight: "600", color: "#fff", fontFamily: "Inter_600SemiBold" },
  participantMore: { backgroundColor: C.borderLight },
  participantMoreText: { fontSize: 12, fontWeight: "600", color: C.textSecondary, fontFamily: "Inter_600SemiBold" },
  removeBtn: { position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: C.error, alignItems: "center", justifyContent: "center" },
  waitingListCard: { backgroundColor: C.card, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#FDE68A" },
  waitingListRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.borderLight },
  waitingRank: { width: 28, alignItems: "center" },
  waitingRankText: { fontSize: 12, color: C.textMuted, fontFamily: "Inter_600SemiBold" },
  waitingAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" },
  waitingAvatarText: { fontSize: 13, fontWeight: "600", color: "#92400E", fontFamily: "Inter_600SemiBold" },
  waitingName: { flex: 1, fontSize: 14, color: C.text, fontFamily: "Inter_500Medium" },
  waitingBadge: { backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  waitingBadgeText: { fontSize: 11, color: "#92400E", fontFamily: "Inter_600SemiBold" },
  promoteBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: C.tagBackground, alignItems: "center", justifyContent: "center" },
  waitingMoreText: { fontSize: 13, color: C.textMuted, fontFamily: "Inter_400Regular", padding: 14, textAlign: "center" },
  chatAccessCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.tagBackground, borderRadius: 16, padding: 16, marginHorizontal: 20, marginTop: 24, borderWidth: 1, borderColor: "rgba(79,70,229,0.2)" },
  chatAccessIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(79,70,229,0.1)", alignItems: "center", justifyContent: "center" },
  chatAccessInfo: { flex: 1 },
  chatAccessTitle: { fontSize: 15, fontWeight: "600", color: C.tint, fontFamily: "Inter_600SemiBold" },
  chatAccessDesc: { fontSize: 13, color: C.tint, fontFamily: "Inter_400Regular", opacity: 0.7, marginTop: 2 },
  footer: { padding: 16, paddingTop: 12, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.borderLight },
  ctaBtn: { backgroundColor: C.tint, borderRadius: 14, paddingVertical: 17, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  ctaBtnJoined: { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.tint },
  ctaBtnWaiting: { backgroundColor: "#FFFBEB", borderWidth: 1.5, borderColor: "#FCD34D" },
  ctaBtnWaitlist: { backgroundColor: "#D97706" },
  ctaBtnText: { fontSize: 16, fontWeight: "600", color: "#fff", fontFamily: "Inter_600SemiBold" },
  ctaBtnTextJoined: { fontSize: 15, fontWeight: "600", color: C.tint, fontFamily: "Inter_600SemiBold" },
  ctaBtnTextWaiting: { fontSize: 15, fontWeight: "600", color: "#D97706", fontFamily: "Inter_600SemiBold" },
  ctaBtnSubtext: { fontSize: 11, color: C.tintLight, fontFamily: "Inter_400Regular" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: C.background },
  notFoundText: { fontSize: 18, color: C.textSecondary, fontFamily: "Inter_500Medium" },
  backBtn2: { backgroundColor: C.tint, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  backBtn2Text: { fontSize: 15, fontWeight: "600", color: "#fff", fontFamily: "Inter_600SemiBold" },
});

const detailStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.borderLight },
  iconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.tagBackground, alignItems: "center", justifyContent: "center", marginTop: 1 },
  content: { flex: 1, gap: 2 },
  label: { fontSize: 12, color: C.textMuted, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 14, color: C.text, fontFamily: "Inter_500Medium", lineHeight: 20 },
});
