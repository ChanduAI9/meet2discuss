import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { useDiscussions, LocationType } from "@/context/DiscussionsContext";

const C = Colors.light;

const CATEGORIES = [
  "AI & Machine Learning",
  "Web3 & Blockchain",
  "Developer Tools",
  "Startups & Entrepreneurship",
  "Design & UX",
  "Engineering",
  "Data Science",
  "Security",
  "Open Source",
];

const DURATIONS = ["30", "45", "60", "90", "120"];
const MAX_PARTICIPANTS_OPTIONS = ["10", "15", "20", "25", "30", "50"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function todayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDisplayDate(year: number, month: number, day: number) {
  return `${MONTHS[month]} ${day}, ${year}`;
}

function formatISODate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseTime12(hour: string, minute: string, period: "AM" | "PM") {
  let h = parseInt(hour);
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return h * 60 + parseInt(minute);
}

function currentTimeMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createDiscussion } = useDiscussions();
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("60");
  const [maxParticipants, setMaxParticipants] = useState("20");
  const [topicsInput, setTopicsInput] = useState("");
  const [showCategories, setShowCategories] = useState(false);

  const today = todayDate();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateError, setDateError] = useState("");

  const [hour, setHour] = useState("10");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeError, setTimeError] = useState("");

  const [locationType, setLocationType] = useState<LocationType>("online");
  const [meetingLink, setMeetingLink] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [city, setCity] = useState("");
  const [mapsLink, setMapsLink] = useState("");

  const hasDate = selectedDay !== null;
  const hasTime = true;
  const displayDate = hasDate
    ? formatDisplayDate(selectedYear!, selectedMonth!, selectedDay!)
    : "";
  const displayTime = `${hour}:${minute} ${period}`;

  const calDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calYear, calMonth]);

  function isDayDisabled(day: number) {
    const cellDate = new Date(calYear, calMonth, day);
    cellDate.setHours(0, 0, 0, 0);
    return cellDate < today;
  }

  function isDaySelected(day: number) {
    return (
      selectedYear === calYear &&
      selectedMonth === calMonth &&
      selectedDay === day
    );
  }

  function isDayToday(day: number) {
    const t = new Date();
    return (
      calYear === t.getFullYear() &&
      calMonth === t.getMonth() &&
      day === t.getDate()
    );
  }

  function handleSelectDay(day: number) {
    if (isDayDisabled(day)) {
      setDateError("You cannot select a past date.");
      return;
    }
    setDateError("");
    setSelectedYear(calYear);
    setSelectedMonth(calMonth);
    setSelectedDay(day);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function validateAndConfirmTime() {
    if (selectedYear === null) {
      setShowTimePicker(false);
      return;
    }
    const selectedDateObj = new Date(selectedYear!, selectedMonth!, selectedDay!);
    selectedDateObj.setHours(0, 0, 0, 0);
    const todayObj = todayDate();
    if (
      selectedDateObj.getTime() === todayObj.getTime()
    ) {
      const selectedMinutes = parseTime12(hour, minute, period);
      if (selectedMinutes <= currentTimeMinutes()) {
        setTimeError("Please choose a future time.");
        return;
      }
    }
    setTimeError("");
    setShowTimePicker(false);
  }

  const isLocationValid = useMemo(() => {
    if (locationType === "online") return meetingLink.trim().length > 0;
    if (locationType === "offline") return city.trim().length > 0;
    if (locationType === "hybrid") return meetingLink.trim().length > 0 && city.trim().length > 0;
    return true;
  }, [locationType, meetingLink, city]);

  const isValid =
    title.trim() &&
    description.trim() &&
    category &&
    hasDate &&
    !dateError &&
    !timeError &&
    isLocationValid;

  async function handleCreate() {
    if (!isValid || !user) return;

    const isoDate = formatISODate(selectedYear!, selectedMonth!, selectedDay!);
    const selectedDateObj = new Date(selectedYear!, selectedMonth!, selectedDay!);
    selectedDateObj.setHours(0, 0, 0, 0);

    if (selectedDateObj < todayDate()) {
      Alert.alert("Invalid Date", "You cannot select a past date.");
      return;
    }

    if (selectedDateObj.getTime() === todayDate().getTime()) {
      const selectedMinutes = parseTime12(hour, minute, period);
      if (selectedMinutes <= currentTimeMinutes()) {
        Alert.alert("Invalid Time", "Please choose a future time.");
        return;
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const topics = topicsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const discussion = await createDiscussion({
        title: title.trim(),
        description: description.trim(),
        category,
        date: isoDate,
        time: displayTime,
        duration,
        maxParticipants: parseInt(maxParticipants),
        coverImage: "custom",
        hostId: user.id,
        hostName: user.name,
        hostRole: `${user.role}${user.company ? ` @ ${user.company}` : ""}`,
        hostReputation: user.reputationScore,
        topics,
        isTrending: false,
        locationType,
        meetingLink: meetingLink.trim() || undefined,
        venueName: venueName.trim() || undefined,
        venueAddress: venueAddress.trim() || undefined,
        city: city.trim() || undefined,
        mapsLink: mapsLink.trim() || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Discussion Created!",
        "Your discussion has been created successfully.",
        [
          { text: "View Discussion", onPress: () => router.push(`/discussion/${discussion.id}`) },
          { text: "OK", onPress: () => router.replace("/(tabs)") },
        ]
      );
    } catch (e) {
      Alert.alert("Error", "Failed to create discussion. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "web" ? 67 : insets.top + 12 },
        ]}
      >
        <Text style={styles.headerTitle}>Create Discussion</Text>
        <Text style={styles.headerSubtitle}>Host a meaningful conversation</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <FieldGroup label="Title" required>
          <TextInput
            style={styles.input}
            placeholder="e.g. Building AI Products at Scale"
            placeholderTextColor={C.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </FieldGroup>

        {/* Description */}
        <FieldGroup label="Description" required>
          <TextInput
            style={styles.textarea}
            placeholder="What will you discuss? Set expectations for participants..."
            placeholderTextColor={C.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </FieldGroup>

        {/* Category */}
        <FieldGroup label="Category" required>
          <Pressable
            style={styles.select}
            onPress={() => setShowCategories(!showCategories)}
          >
            <Text style={category ? styles.selectValue : styles.selectPlaceholder}>
              {category || "Select a category"}
            </Text>
            <Feather name={showCategories ? "chevron-up" : "chevron-down"} size={18} color={C.textMuted} />
          </Pressable>
          {showCategories && (
            <View style={styles.dropdown}>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.dropdownItem, category === cat && styles.dropdownItemActive]}
                    onPress={() => { setCategory(cat); setShowCategories(false); }}
                  >
                    <Text style={[styles.dropdownText, category === cat && styles.dropdownTextActive]}>{cat}</Text>
                    {category === cat && <Feather name="check" size={16} color={C.tint} />}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </FieldGroup>

        {/* Date Picker */}
        <FieldGroup label="Date" required>
          <Pressable
            style={[styles.pickerTrigger, dateError ? styles.pickerTriggerError : null]}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather name="calendar" size={18} color={hasDate ? C.tint : C.textMuted} />
            <Text style={[styles.pickerTriggerText, !hasDate && styles.pickerTriggerPlaceholder]}>
              {hasDate ? displayDate : "Select a date"}
            </Text>
            <Feather name="chevron-right" size={16} color={C.textMuted} />
          </Pressable>
          {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
        </FieldGroup>

        {/* Time Picker */}
        <FieldGroup label="Time" required>
          <Pressable
            style={[styles.pickerTrigger, timeError ? styles.pickerTriggerError : null]}
            onPress={() => setShowTimePicker(true)}
          >
            <Feather name="clock" size={18} color={C.tint} />
            <Text style={styles.pickerTriggerText}>{displayTime}</Text>
            <Feather name="chevron-right" size={16} color={C.textMuted} />
          </Pressable>
          {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}
        </FieldGroup>

        {/* Duration */}
        <FieldGroup label="Duration (minutes)">
          <View style={styles.chipRow}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d}
                style={[styles.chip, duration === d && styles.chipActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDuration(d); }}
              >
                <Text style={[styles.chipText, duration === d && styles.chipTextActive]}>{d}m</Text>
              </Pressable>
            ))}
          </View>
        </FieldGroup>

        {/* Location Type */}
        <FieldGroup label="Discussion Type" required>
          <View style={styles.locationTypeRow}>
            {(["online", "offline", "hybrid"] as LocationType[]).map((type) => (
              <Pressable
                key={type}
                style={[styles.locationTypeBtn, locationType === type && styles.locationTypeBtnActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLocationType(type); }}
              >
                <Feather
                  name={type === "online" ? "video" : type === "offline" ? "map-pin" : "shuffle"}
                  size={14}
                  color={locationType === type ? C.tint : C.textSecondary}
                />
                <Text style={[styles.locationTypeText, locationType === type && styles.locationTypeTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Online fields */}
          {(locationType === "online" || locationType === "hybrid") && (
            <View style={styles.locationFields}>
              {locationType === "hybrid" && (
                <Text style={styles.locationSectionLabel}>
                  <Feather name="video" size={12} color={C.tint} /> Online Details
                </Text>
              )}
              <TextInput
                style={styles.input}
                placeholder="Meeting link (Google Meet / Zoom)"
                placeholderTextColor={C.textMuted}
                value={meetingLink}
                onChangeText={setMeetingLink}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>
          )}

          {/* Offline fields */}
          {(locationType === "offline" || locationType === "hybrid") && (
            <View style={styles.locationFields}>
              {locationType === "hybrid" && (
                <Text style={styles.locationSectionLabel}>
                  <Feather name="map-pin" size={12} color={C.tint} /> Venue Details
                </Text>
              )}
              <TextInput
                style={styles.input}
                placeholder="Venue name"
                placeholderTextColor={C.textMuted}
                value={venueName}
                onChangeText={setVenueName}
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="Address"
                placeholderTextColor={C.textMuted}
                value={venueAddress}
                onChangeText={setVenueAddress}
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="City, State (e.g. San Francisco, CA)"
                placeholderTextColor={C.textMuted}
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="Google Maps link (optional)"
                placeholderTextColor={C.textMuted}
                value={mapsLink}
                onChangeText={setMapsLink}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>
          )}
        </FieldGroup>

        {/* Max Participants */}
        <FieldGroup label="Max Participants">
          <View style={styles.chipRow}>
            {MAX_PARTICIPANTS_OPTIONS.map((n) => (
              <Pressable
                key={n}
                style={[styles.chip, maxParticipants === n && styles.chipActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMaxParticipants(n); }}
              >
                <Text style={[styles.chipText, maxParticipants === n && styles.chipTextActive]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </FieldGroup>

        {/* Topics */}
        <FieldGroup label="Topics" hint="Comma-separated">
          <TextInput
            style={styles.input}
            placeholder="e.g. LLMs, Product Strategy, MLOps"
            placeholderTextColor={C.textMuted}
            value={topicsInput}
            onChangeText={setTopicsInput}
          />
        </FieldGroup>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.createBtn,
            !isValid && styles.createBtnDisabled,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed && !!isValid ? 0.98 : 1 }] },
          ]}
          onPress={handleCreate}
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="plus" size={20} color="#fff" />
              <Text style={styles.createBtnText}>Create Discussion</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <Pressable onPress={() => setShowDatePicker(false)} hitSlop={8}>
                <Feather name="x" size={22} color={C.text} />
              </Pressable>
            </View>

            {/* Month Nav */}
            <View style={styles.calNavRow}>
              <Pressable
                style={styles.calNavBtn}
                onPress={() => {
                  if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                  else setCalMonth(calMonth - 1);
                }}
              >
                <Feather name="chevron-left" size={20} color={C.text} />
              </Pressable>
              <Text style={styles.calMonthLabel}>{MONTHS[calMonth]} {calYear}</Text>
              <Pressable
                style={styles.calNavBtn}
                onPress={() => {
                  if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                  else setCalMonth(calMonth + 1);
                }}
              >
                <Feather name="chevron-right" size={20} color={C.text} />
              </Pressable>
            </View>

            {/* Day of week headers */}
            <View style={styles.calDowRow}>
              {DAYS_OF_WEEK.map((d) => (
                <Text key={d} style={styles.calDow}>{d}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calGrid}>
              {calDays.map((day, idx) => {
                if (!day) return <View key={idx} style={styles.calCell} />;
                const disabled = isDayDisabled(day);
                const selected = isDaySelected(day);
                const isToday = isDayToday(day);
                return (
                  <Pressable
                    key={idx}
                    style={[
                      styles.calCell,
                      selected && styles.calCellSelected,
                      isToday && !selected && styles.calCellToday,
                    ]}
                    onPress={() => handleSelectDay(day)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.calDayText,
                        disabled && styles.calDayDisabled,
                        selected && styles.calDaySelected,
                        isToday && !selected && styles.calDayToday,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {dateError ? <Text style={[styles.errorText, { textAlign: "center", marginTop: 8 }]}>{dateError}</Text> : null}

            <Pressable
              style={[styles.modalConfirmBtn, !hasDate && styles.createBtnDisabled]}
              onPress={() => { if (hasDate) setShowDatePicker(false); }}
              disabled={!hasDate}
            >
              <Text style={styles.modalConfirmText}>
                {hasDate ? `Confirm — ${displayDate}` : "Pick a day above"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <Pressable onPress={() => setShowTimePicker(false)} hitSlop={8}>
                <Feather name="x" size={22} color={C.text} />
              </Pressable>
            </View>

            <View style={styles.timePreview}>
              <Text style={styles.timePreviewText}>{hour}:{minute} {period}</Text>
            </View>

            <View style={styles.timePickerRow}>
              {/* Hours */}
              <View style={styles.timeCol}>
                <Text style={styles.timeColLabel}>Hour</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {HOURS.map((h) => (
                    <Pressable
                      key={h}
                      style={[styles.timeItem, hour === h && styles.timeItemActive]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setHour(h); }}
                    >
                      <Text style={[styles.timeItemText, hour === h && styles.timeItemTextActive]}>{h}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.timeColon}>:</Text>

              {/* Minutes */}
              <View style={styles.timeCol}>
                <Text style={styles.timeColLabel}>Min</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {MINUTES.map((m) => (
                    <Pressable
                      key={m}
                      style={[styles.timeItem, minute === m && styles.timeItemActive]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMinute(m); }}
                    >
                      <Text style={[styles.timeItemText, minute === m && styles.timeItemTextActive]}>{m}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* AM/PM */}
              <View style={styles.timeCol}>
                <Text style={styles.timeColLabel}>Period</Text>
                <View style={styles.ampmCol}>
                  {(["AM", "PM"] as const).map((p) => (
                    <Pressable
                      key={p}
                      style={[styles.ampmBtn, period === p && styles.ampmBtnActive]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPeriod(p); }}
                    >
                      <Text style={[styles.ampmText, period === p && styles.ampmTextActive]}>{p}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {timeError ? <Text style={[styles.errorText, { textAlign: "center", marginTop: 4 }]}>{timeError}</Text> : null}

            <Pressable style={styles.modalConfirmBtn} onPress={validateAndConfirmTime}>
              <Text style={styles.modalConfirmText}>Confirm — {hour}:{minute} {period}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FieldGroup({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>
          {label}
          {required && <Text style={{ color: C.error }}> *</Text>}
        </Text>
        {hint && <Text style={styles.fieldHint}>{hint}</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    backgroundColor: C.card,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: 4,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: C.text, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: C.textSecondary, fontFamily: "Inter_400Regular" },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 20 },
  fieldGroup: { gap: 8 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: C.text, fontFamily: "Inter_600SemiBold" },
  fieldHint: { fontSize: 12, color: C.textMuted, fontFamily: "Inter_400Regular" },
  input: {
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
    minHeight: 120,
    lineHeight: 22,
  },
  charCount: { fontSize: 12, color: C.textMuted, fontFamily: "Inter_400Regular", alignSelf: "flex-end" },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: C.border,
  },
  selectValue: { fontSize: 15, color: C.text, fontFamily: "Inter_400Regular" },
  selectPlaceholder: { fontSize: 15, color: C.textMuted, fontFamily: "Inter_400Regular" },
  dropdown: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  dropdownItemActive: { backgroundColor: C.tagBackground },
  dropdownText: { fontSize: 14, color: C.text, fontFamily: "Inter_400Regular" },
  dropdownTextActive: { color: C.tint, fontFamily: "Inter_600SemiBold" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.inputBackground,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: { backgroundColor: C.tagBackground, borderColor: C.tint },
  chipText: { fontSize: 13, color: C.textSecondary, fontFamily: "Inter_500Medium" },
  chipTextActive: { color: C.tint, fontFamily: "Inter_600SemiBold" },
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: C.border,
  },
  pickerTriggerError: { borderColor: C.error },
  pickerTriggerText: { flex: 1, fontSize: 15, color: C.text, fontFamily: "Inter_500Medium" },
  pickerTriggerPlaceholder: { color: C.textMuted, fontFamily: "Inter_400Regular" },
  errorText: { fontSize: 12, color: C.error, fontFamily: "Inter_500Medium", marginTop: 4 },
  locationTypeRow: { flexDirection: "row", gap: 8 },
  locationTypeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: C.inputBackground,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  locationTypeBtnActive: { backgroundColor: C.tagBackground, borderColor: C.tint },
  locationTypeText: { fontSize: 13, color: C.textSecondary, fontFamily: "Inter_500Medium" },
  locationTypeTextActive: { color: C.tint, fontFamily: "Inter_600SemiBold" },
  locationFields: { marginTop: 12, gap: 0 },
  locationSectionLabel: {
    fontSize: 12,
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footer: {
    padding: 16,
    paddingTop: 12,
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  createBtn: {
    backgroundColor: C.tint,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  createBtnDisabled: { backgroundColor: C.textMuted },
  createBtnText: { fontSize: 16, fontWeight: "600", color: "#fff", fontFamily: "Inter_600SemiBold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: C.text, fontFamily: "Inter_700Bold" },
  calNavRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  calNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.inputBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  calMonthLabel: { fontSize: 16, fontWeight: "600", color: C.text, fontFamily: "Inter_600SemiBold" },
  calDowRow: { flexDirection: "row" },
  calDow: { flex: 1, textAlign: "center", fontSize: 12, color: C.textMuted, fontFamily: "Inter_600SemiBold", paddingVertical: 4 },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  calCellSelected: { backgroundColor: C.tint },
  calCellToday: { backgroundColor: C.tagBackground },
  calDayText: { fontSize: 14, color: C.text, fontFamily: "Inter_500Medium" },
  calDayDisabled: { color: C.borderLight },
  calDaySelected: { color: "#fff", fontFamily: "Inter_700Bold" },
  calDayToday: { color: C.tint, fontFamily: "Inter_700Bold" },
  modalConfirmBtn: {
    backgroundColor: C.tint,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalConfirmText: { fontSize: 15, fontWeight: "600", color: "#fff", fontFamily: "Inter_600SemiBold" },
  timePreview: { alignItems: "center", paddingVertical: 8 },
  timePreviewText: { fontSize: 36, fontWeight: "700", color: C.tint, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  timePickerRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  timeCol: { flex: 1, alignItems: "center", gap: 8 },
  timeColLabel: { fontSize: 12, color: C.textMuted, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  timeScroll: { maxHeight: 180, width: "100%" },
  timeItem: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  timeItemActive: { backgroundColor: C.tint },
  timeItemText: { fontSize: 16, color: C.text, fontFamily: "Inter_500Medium" },
  timeItemTextActive: { color: "#fff", fontFamily: "Inter_700Bold" },
  timeColon: { fontSize: 28, color: C.textMuted, fontFamily: "Inter_700Bold", marginTop: 36 },
  ampmCol: { gap: 8, width: "100%" },
  ampmBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: C.inputBackground,
    borderWidth: 1,
    borderColor: C.border,
    marginHorizontal: 4,
  },
  ampmBtnActive: { backgroundColor: C.tint, borderColor: C.tint },
  ampmText: { fontSize: 15, color: C.text, fontFamily: "Inter_600SemiBold" },
  ampmTextActive: { color: "#fff" },
});
