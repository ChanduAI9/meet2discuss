import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { DiscussionCard } from "@/components/DiscussionCard";
import { useAuth } from "@/context/AuthContext";
import { useDiscussions } from "@/context/DiscussionsContext";

const C = Colors.light;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { discussions, joinDiscussion, refreshDiscussions } = useDiscussions();
  const [refreshing, setRefreshing] = useState(false);

  const trending = discussions.filter((d) => d.isTrending);
  const upcoming = discussions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);
  const nearby = discussions.filter((d) => !d.isOnline).slice(0, 3);

  async function handleRefresh() {
    setRefreshing(true);
    await refreshDiscussions();
    setRefreshing(false);
  }

  async function handleJoin(discussionId: string) {
    if (!user) return;
    await joinDiscussion(discussionId, user.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {getGreeting()},{" "}
            <Text style={styles.greetingName}>
              {user?.name?.split(" ")[0] || "Builder"}
            </Text>
          </Text>
          <Text style={styles.subGreeting}>
            Discover your next great discussion
          </Text>
        </View>
        <Pressable
          style={styles.notifBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="bell" size={22} color={C.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 + 84 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.tint} />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{discussions.length}</Text>
            <Text style={styles.statLabel}>Discussions</Text>
          </View>
          <View style={[styles.statCard, styles.statCardHighlight]}>
            <Text style={[styles.statNumber, { color: "#fff" }]}>
              {discussions.filter((d) => user && d.participants.includes(user.id)).length}
            </Text>
            <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.8)" }]}>Joined</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{user?.reputationScore ?? 0}</Text>
            <Text style={styles.statLabel}>Reputation</Text>
          </View>
        </View>

        {/* Trending Discussions */}
        <Section title="Trending Discussions" icon="trending-up" onSeeAll={() => router.push("/(tabs)/discover")}>
          {trending.map((d) => (
            <DiscussionCard
              key={d.id}
              discussion={d}
              userId={user?.id}
              onJoin={handleJoin}
            />
          ))}
        </Section>

        {/* Upcoming Discussions */}
        <Section title="Upcoming Discussions" icon="calendar" onSeeAll={() => router.push("/(tabs)/discover")}>
          {upcoming.map((d) => (
            <DiscussionCard
              key={d.id}
              discussion={d}
              userId={user?.id}
              onJoin={handleJoin}
              compact
            />
          ))}
        </Section>

        {/* Nearby Discussions */}
        {nearby.length > 0 && (
          <Section title="In Person Nearby" icon="map-pin">
            {nearby.map((d) => (
              <DiscussionCard
                key={d.id}
                discussion={d}
                userId={user?.id}
                onJoin={handleJoin}
                compact
              />
            ))}
          </Section>
        )}
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  icon,
  onSeeAll,
  children,
}: {
  title: string;
  icon: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Feather name={icon as any} size={16} color={C.tint} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {onSeeAll && (
          <Pressable onPress={onSeeAll}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  greetingName: {
    color: C.tint,
  },
  subGreeting: {
    fontSize: 14,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.inputBackground,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 28,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  statCardHighlight: {
    backgroundColor: C.tint,
    borderColor: C.tint,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
  },
});
