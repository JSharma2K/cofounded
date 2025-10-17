import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Message } from '../lib/types';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const messageDate = new Date(message.created_at);
  const now = new Date();
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  let timeText = '';
  if (diffMins < 1) {
    timeText = 'Just now';
  } else if (diffMins < 60) {
    timeText = `${diffMins}m`;
  } else if (diffMins < 1440) { // less than 24 hours
    timeText = messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    timeText = messageDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    }) + ' ' + messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.body, isOwn ? styles.ownBody : styles.otherBody]}>
          {message.body}
        </Text>
        <View style={styles.timestampRow}>
          <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
            {timeText}
          </Text>
          {isOwn && (
            <MaterialCommunityIcons 
              name="check-all" 
              size={14} 
              color={colors.textTertiary} 
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs + 2,
    marginHorizontal: spacing.md,
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.xl,
    ...shadows.small,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  otherBubble: {
    backgroundColor: colors.surfaceLight,
    borderBottomLeftRadius: borderRadius.sm,
  },
  body: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    lineHeight: typography.fontSizes.base * typography.lineHeights.normal,
  },
  ownBody: {
    color: colors.text,
  },
  otherBody: {
    color: colors.text,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  timestamp: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamilies.regular,
  },
  ownTimestamp: {
    color: `${colors.text}99`,
  },
  otherTimestamp: {
    color: colors.textTertiary,
  },
});

