import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
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
import { ChatMessage, useDiscussions } from "@/context/DiscussionsContext";

const C = Colors.light;

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getDiscussion, getMessages, sendMessage } = useDiscussions();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const discussion = getDiscussion(id!);
  const isHost = user?.id === discussion?.hostId;

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  async function loadMessages() {
    if (!id) return;
    const msgs = await getMessages(id);
    setMessages(msgs);
  }

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !user || !discussion) return;
    const text = inputText.trim();
    setInputText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSending(true);
    try {
      await sendMessage({
        discussionId: id!,
        senderId: user.id,
        senderName: user.name || "Anonymous",
        senderRole: user.role || "",
        content: text,
      });
      await loadMessages();
    } finally {
      setIsSending(false);
    }
  }, [inputText, user, discussion, id]);

  if (!discussion) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Discussion not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: C.tint }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  function formatTime(ts: string) {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  function formatDate(ts: string) {
    const d = new Date(ts);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return "Today";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
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
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {discussion.title}
            </Text>
            <Text style={styles.headerSubtitle}>
              {discussion.participants.length} participants
              {isHost ? " · Host" : ""}
            </Text>
          </View>
          <Pressable
            style={styles.participantsBtn}
            onPress={() =>
              router.push(`/discussion/${id}`)
            }
          >
            <View style={styles.miniAvatarStack}>
              {discussion.participants.slice(0, 3).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.miniAvatar,
                    { marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i },
                  ]}
                />
              ))}
            </View>
          </Pressable>
        </View>

        {/* Messages (inverted FlatList) */}
        <FlatList
          ref={flatListRef}
          data={sortedMessages}
          keyExtractor={(item) => item.id}
          inverted
          style={styles.messageList}
          contentContainerStyle={[
            styles.messageListContent,
            {
              paddingBottom:
                Platform.OS === "web" ? 34 : insets.bottom + 16,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!!sortedMessages.length}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Feather name="message-circle" size={40} color={C.textMuted} />
              <Text style={styles.emptyTitle}>Start the conversation</Text>
              <Text style={styles.emptyDesc}>
                Be the first to say something!
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const isMine = item.senderId === user?.id;
            const isHostMsg = item.senderId === discussion.hostId;
            const prevItem = sortedMessages[index + 1];
            const showDate =
              !prevItem ||
              new Date(item.timestamp).toDateString() !==
                new Date(prevItem.timestamp).toDateString();
            const showAvatar =
              !isMine &&
              (!prevItem ||
                prevItem.senderId !== item.senderId ||
                showDate);

            return (
              <View>
                {showDate && (
                  <View style={styles.dateDivider}>
                    <View style={styles.dateLine} />
                    <Text style={styles.dateText}>
                      {formatDate(item.timestamp)}
                    </Text>
                    <View style={styles.dateLine} />
                  </View>
                )}
                <View
                  style={[
                    styles.messageRow,
                    isMine ? styles.messageRowMine : styles.messageRowOther,
                  ]}
                >
                  {!isMine && (
                    <View
                      style={[
                        styles.senderAvatar,
                        !showAvatar && styles.senderAvatarHidden,
                      ]}
                    >
                      {showAvatar && (
                        <Text style={styles.senderAvatarText}>
                          {item.senderName.charAt(0)}
                        </Text>
                      )}
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.bubbleMine : styles.bubbleOther,
                    ]}
                  >
                    {!isMine && showAvatar && (
                      <View style={styles.senderInfo}>
                        <Text style={styles.senderName}>
                          {item.senderName}
                          {isHostMsg && (
                            <Text style={styles.hostLabel}> · Host</Text>
                          )}
                        </Text>
                        {item.senderRole && (
                          <Text style={styles.senderRole}>
                            {item.senderRole}
                          </Text>
                        )}
                      </View>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        isMine ? styles.messageTextMine : styles.messageTextOther,
                      ]}
                    >
                      {item.content}
                    </Text>
                    <Text
                      style={[
                        styles.timestamp,
                        isMine ? styles.timestampMine : styles.timestampOther,
                      ]}
                    >
                      {formatTime(item.timestamp)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom:
                Platform.OS === "web" ? 34 : insets.bottom + 8,
            },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={C.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="default"
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            <Feather
              name="send"
              size={18}
              color={inputText.trim() ? "#fff" : C.textMuted}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.inputBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  participantsBtn: {
    padding: 4,
  },
  miniAvatarStack: {
    flexDirection: "row",
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.tintLight,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 4,
  },
  emptyMessages: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
    transform: [{ scaleY: -1 }],
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
  },
  dateDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 12,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dateText: {
    fontSize: 12,
    color: C.textMuted,
    fontFamily: "Inter_500Medium",
  },
  messageRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.tint,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  senderAvatarHidden: {
    backgroundColor: "transparent",
  },
  senderAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  bubbleMine: {
    backgroundColor: C.tint,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: C.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  senderInfo: {
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: C.tint,
    fontFamily: "Inter_600SemiBold",
  },
  hostLabel: {
    color: "#F59E0B",
  },
  senderRole: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: "Inter_400Regular",
  },
  messageText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  messageTextMine: {
    color: "#fff",
  },
  messageTextOther: {
    color: C.text,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  timestampMine: {
    color: "rgba(255,255,255,0.6)",
  },
  timestampOther: {
    color: C.textMuted,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
  input: {
    flex: 1,
    backgroundColor: C.inputBackground,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    fontSize: 15,
    color: C.text,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    borderColor: C.border,
    maxHeight: 120,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: C.borderLight,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: C.background,
  },
  notFoundText: {
    fontSize: 18,
    color: C.textSecondary,
    fontFamily: "Inter_500Medium",
  },
});
