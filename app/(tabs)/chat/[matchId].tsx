import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  TextInput as RNTextInput,
  Text as RNText,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSession } from '../../../lib/hooks/useSession';
import { getMessages, sendMessage, subscribeToMessages } from '../../../lib/api/messages';
import { MessageBubble } from '../../../components/MessageBubble';
import type { Message } from '../../../lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { colors, typography, spacing, borderRadius, shadows } from '../../../utils/theme';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!matchId || !user) return;

    const loadMessages = async () => {
      try {
        const data = await getMessages(Number(matchId));
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new messages
    channelRef.current = subscribeToMessages(Number(matchId), (newMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [matchId, user]);

  const handleSend = async () => {
    if (!messageText.trim() || !user || !matchId || sending) return;

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      await sendMessage(Number(matchId), user.id, text);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessageText(text); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {messages.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="message-text-outline" size={48} color={colors.textTertiary} />
          <RNText style={styles.emptyTitle}>Start the conversation</RNText>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Say hello and start building something amazing together
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwn={item.sender_id === user?.id} />
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.composer}>
        <View style={styles.inputContainer}>
          <RNTextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            multiline
            maxLength={1000}
            editable={!sending}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
            style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <MaterialCommunityIcons 
                name="send" 
                size={24} 
                color={colors.text}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  messageList: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
  composer: {
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});

