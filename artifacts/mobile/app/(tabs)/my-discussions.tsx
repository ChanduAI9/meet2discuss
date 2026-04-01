import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
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

const TABS = ["Upcoming", "Past", "Hosted"] as const;
type TabType = typeof TABS[number];

export default function MyDiscussionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { discussions } = useDiscussions();
  const [activeTab, setActiveTab] = useState<TabType>("Upcoming");

  const now = new Date();

  const joined = discussions.filter(
    (d) => user && d.participants.includes(user.id) && d.hostId !== user.id
  );
  const hosted = discussions.filter((d) => user && d.hostId === user.id);

  const upcoming = joined.filter((d) => new Date(d.date) >= now);
  const past = joined.filter((d) => new Date(d.date) < now);

  const displayList =
    activeTab === "Upcoming"
      ? upcoming
      : activeTab === "Past"
      ? past
      : hosted;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
          },
        ]}
      >
        <Text style={styles.headerTitle}>My Discussions</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((tab) => {
            const count =
              tab === "Upcoming"
                ? upcoming.length
                : tab === "Past"
                ? past.length
                : hosted.length;
            return (
              <Pressable
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.tabActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.tabBadge,
                      activeTab === tab && styles.tabBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabBadgeText,
                        activeTab === tab && styles.tabBadgeTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
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
      >
        {displayList.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          displayList.map((d) => (
            <DiscussionCard
              key={d.id}
              discussion={d}
              userId={user?.id}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function EmptyState({ tab }: { tab: TabType }) {
  const messages = {
    Upcoming: {
      icon: "calendar" as const,
      title: "No upcoming discussions",
      desc: "Discover and join discussions to see them here",
      action: "Discover Discussions",
      onPress: () => router.push("/(tabs)/discover"),
    },
    Past: {
      icon: "clock" as const,
      title: "No past discussions yet",
      desc: "Your discussion history will appear here",
      action: null,
      onPress: null,
    },
    Hosted: {
      icon: "mic" as const,
      title: "You haven't hosted yet",
      desc: "Create your first discussion and lead the conversation",
      action: "Create a Discussion",
      onPress: () => router.push("/(tabs)/create"),
    },
  };

  const msg = messages[tab];

  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconContainer}>
        <Feather name={msg.icon} size={32} color={C.tint} />
      </View>
      <Text style={emptyStyles.title}>{msg.title}</Text>
      <Text style={emptyStyles.desc}>{msg.desc}</Text>
      {msg.action && msg.onPress && (
        <Pressable
          style={({ pressed }) => [
            emptyStyles.btn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={msg.onPress}
        >
          <Text style={emptyStyles.btnText}>{msg.action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    backgroundColor: C.card,
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tabs: {
    flexDirection: "row",
    gap: 0,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: C.tint,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  tabTextActive: {
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
  },
  tabBadge: {
    backgroundColor: C.borderLight,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tabBadgeActive: {
    backgroundColor: C.tagBackground,
  },
  tabBadgeText: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: "Inter_600SemiBold",
  },
  tabBadgeTextActive: {
    color: C.tint,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 0,
  },
});

const emptyStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: C.tagBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  desc: {
    fontSize: 15,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  btn: {
    backgroundColor: C.tint,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  btnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
});
