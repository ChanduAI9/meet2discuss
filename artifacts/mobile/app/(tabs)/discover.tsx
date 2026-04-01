import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState, useMemo } from "react";
import {
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
import { DiscussionCard } from "@/components/DiscussionCard";
import { useAuth } from "@/context/AuthContext";
import { useDiscussions } from "@/context/DiscussionsContext";

const C = Colors.light;

const CATEGORIES = [
  "All",
  "AI & Machine Learning",
  "Web3 & Blockchain",
  "Developer Tools",
  "Startups & Entrepreneurship",
  "Design & UX",
  "Engineering",
];

const FILTERS = ["All", "Online", "In Person", "Trending", "Upcoming"];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { discussions, joinDiscussion } = useDiscussions();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filtered = useMemo(() => {
    return discussions.filter((d) => {
      const matchesSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase()) ||
        d.hostName.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || d.category === selectedCategory;

      const matchesFilter =
        selectedFilter === "All" ||
        (selectedFilter === "Online" && d.isOnline) ||
        (selectedFilter === "In Person" && !d.isOnline) ||
        (selectedFilter === "Trending" && d.isTrending) ||
        (selectedFilter === "Upcoming" &&
          new Date(d.date) > new Date());

      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [discussions, search, selectedCategory, selectedFilter]);

  async function handleJoin(discussionId: string) {
    if (!user) return;
    await joinDiscussion(discussionId, user.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

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
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find discussions that matter to you</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={C.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions, hosts..."
            placeholderTextColor={C.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={16} color={C.textMuted} />
            </Pressable>
          )}
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[
                styles.filterChip,
                selectedFilter === f && styles.filterChipActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFilter(f);
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === f && styles.filterChipTextActive,
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory(cat);
              }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filtered.length} discussion{filtered.length !== 1 ? "s" : ""}
          </Text>
          {(search || selectedCategory !== "All" || selectedFilter !== "All") && (
            <Pressable
              onPress={() => {
                setSearch("");
                setSelectedCategory("All");
                setSelectedFilter("All");
              }}
            >
              <Text style={styles.clearAll}>Clear filters</Text>
            </Pressable>
          )}
        </View>

        {/* Results */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color={C.textMuted} />
            <Text style={styles.emptyTitle}>No discussions found</Text>
            <Text style={styles.emptyDesc}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          filtered.map((d) => (
            <DiscussionCard
              key={d.id}
              discussion={d}
              userId={user?.id}
              onJoin={handleJoin}
            />
          ))
        )}
      </ScrollView>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBackground,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    fontFamily: "Inter_400Regular",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  filtersRow: {
    gap: 8,
    paddingRight: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  filterChipActive: {
    backgroundColor: C.tint,
    borderColor: C.tint,
  },
  filterChipText: {
    fontSize: 13,
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  filterChipTextActive: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  categoriesRow: {
    gap: 8,
    paddingRight: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.borderLight,
  },
  categoryChipActive: {
    backgroundColor: C.tagBackground,
  },
  categoryChipText: {
    fontSize: 12,
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  categoryChipTextActive: {
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultsCount: {
    fontSize: 14,
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  clearAll: {
    fontSize: 13,
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: C.text,
    fontFamily: "Inter_600SemiBold",
  },
  emptyDesc: {
    fontSize: 14,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
