import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const C = Colors.light;

const EXPERTISE_OPTIONS = [
  "AI/ML", "Web3", "DevOps", "Mobile", "Frontend", "Backend",
  "Data Science", "Product", "Design", "Security", "Cloud", "Open Source",
  "Startups", "Leadership", "Architecture",
];

const ROLES = [
  "Software Engineer", "Senior Engineer", "Staff Engineer", "Engineering Manager",
  "CTO", "Product Manager", "Designer", "Data Scientist", "ML Engineer",
  "Founder", "Indie Hacker", "Researcher",
];

export default function OnboardingScreen() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [bio, setBio] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showRoles, setShowRoles] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { saveProfile, user } = useAuth();

  function toggleTag(tag: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  async function handleSave() {
    if (!name.trim() || !role.trim()) {
      Alert.alert("Required Fields", "Please enter your name and role.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      await saveProfile({
        name: name.trim(),
        role,
        company: company.trim(),
        yearsExperience: yearsExp,
        expertiseTags: selectedTags,
        bio: bio.trim(),
        linkedIn: linkedIn.trim(),
      });
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("Error", "Failed to save profile.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
          },
        ]}
      >
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.headerTitle}>Build Your Profile</Text>
        <Text style={styles.headerSubtitle}>
          Help others know who you are
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Full Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sarah Chen"
            placeholderTextColor={C.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Role */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Professional Role <Text style={styles.required}>*</Text>
          </Text>
          <Pressable
            style={styles.input}
            onPress={() => setShowRoles(!showRoles)}
          >
            <Text
              style={role ? styles.inputText : styles.inputPlaceholder}
            >
              {role || "Select your role"}
            </Text>
            <Feather
              name={showRoles ? "chevron-up" : "chevron-down"}
              size={18}
              color={C.textMuted}
            />
          </Pressable>
          {showRoles && (
            <View style={styles.dropdown}>
              {ROLES.map((r) => (
                <Pressable
                  key={r}
                  style={[
                    styles.dropdownItem,
                    role === r && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setRole(r);
                    setShowRoles(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      role === r && styles.dropdownTextSelected,
                    ]}
                  >
                    {r}
                  </Text>
                  {role === r && (
                    <Feather name="check" size={16} color={C.tint} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Company */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Company / Organization</Text>
          <TextInput
            style={styles.inputFlat}
            placeholder="Where do you work?"
            placeholderTextColor={C.textMuted}
            value={company}
            onChangeText={setCompany}
          />
        </View>

        {/* Years of Experience */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Years of Experience</Text>
          <View style={styles.expRow}>
            {["0-1", "1-3", "3-5", "5-10", "10+"].map((y) => (
              <Pressable
                key={y}
                style={[
                  styles.expChip,
                  yearsExp === y && styles.expChipSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setYearsExp(y);
                }}
              >
                <Text
                  style={[
                    styles.expChipText,
                    yearsExp === y && styles.expChipTextSelected,
                  ]}
                >
                  {y}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Expertise Tags */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Areas of Expertise{" "}
            <Text style={styles.labelHint}>(up to 5)</Text>
          </Text>
          <View style={styles.tagsGrid}>
            {EXPERTISE_OPTIONS.map((tag) => (
              <Pressable
                key={tag}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.tagSelected,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Tell the community about yourself, your work, and what you're passionate about..."
            placeholderTextColor={C.textMuted}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* LinkedIn */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>LinkedIn Profile</Text>
          <TextInput
            style={styles.inputFlat}
            placeholder="linkedin.com/in/yourname"
            placeholderTextColor={C.textMuted}
            value={linkedIn}
            onChangeText={setLinkedIn}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 : insets.bottom + 16,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Complete Profile</Text>
          )}
        </Pressable>
      </View>
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
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    width: "60%",
    height: "100%",
    backgroundColor: C.tint,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
  },
  headerSubtitle: {
    fontSize: 15,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    fontFamily: "Inter_600SemiBold",
  },
  labelHint: {
    fontWeight: "400",
    color: C.textMuted,
    fontFamily: "Inter_400Regular",
  },
  required: {
    color: C.error,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: C.border,
    fontSize: 15,
    color: C.text,
    fontFamily: "Inter_400Regular",
  },
  inputFlat: {
    backgroundColor: C.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: C.border,
    fontSize: 15,
    color: C.text,
    fontFamily: "Inter_400Regular",
  },
  inputText: {
    fontSize: 15,
    color: C.text,
    fontFamily: "Inter_400Regular",
  },
  inputPlaceholder: {
    fontSize: 15,
    color: C.textMuted,
    fontFamily: "Inter_400Regular",
  },
  dropdown: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  dropdownItemSelected: {
    backgroundColor: C.tagBackground,
  },
  dropdownText: {
    fontSize: 15,
    color: C.text,
    fontFamily: "Inter_400Regular",
  },
  dropdownTextSelected: {
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
  },
  expRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  expChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.inputBackground,
    borderWidth: 1,
    borderColor: C.border,
  },
  expChipSelected: {
    backgroundColor: C.tagBackground,
    borderColor: C.tint,
  },
  expChipText: {
    fontSize: 14,
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  expChipTextSelected: {
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.inputBackground,
    borderWidth: 1,
    borderColor: C.border,
  },
  tagSelected: {
    backgroundColor: C.tagBackground,
    borderColor: C.tint,
  },
  tagText: {
    fontSize: 13,
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  tagTextSelected: {
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
  },
  textarea: {
    backgroundColor: C.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 13,
    borderWidth: 1,
    borderColor: C.border,
    fontSize: 15,
    color: C.text,
    fontFamily: "Inter_400Regular",
    minHeight: 100,
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    paddingTop: 12,
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  saveBtn: {
    backgroundColor: C.tint,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
});
