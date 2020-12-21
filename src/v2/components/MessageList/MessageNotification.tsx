import React from 'react';
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '../../contexts/themeContext/ThemeContext';
import { Down } from '../../icons';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 20,
    elevation: 5,
    height: 40,
    justifyContent: 'center',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: 40,
  },
  touchable: {
    bottom: 20,
    position: 'absolute',
    right: 20,
  },
  unreadCountNotificationContainer: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 4,
    position: 'absolute',
    top: 0,
  },
  unreadCountNotificationText: {
    fontSize: 11,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  wrapper: {
    alignItems: 'center',
    height: 50,
    justifyContent: 'flex-end',
  },
});

export type MessageNotificationProps = {
  /** onPress handler */
  onPress: (event: GestureResponderEvent) => void;
  /** If we should show the notification or not */
  showNotification?: boolean;
  unreadCount?: number;
};

/**
 * @example ./MessageNotification.md
 */
export const MessageNotification: React.FC<MessageNotificationProps> = (
  props,
) => {
  const { onPress, showNotification = true, unreadCount } = props;

  const {
    theme: {
      messageList: {
        messageNotification: {
          container,
          touchable,
          unreadCountNotificationContainer,
          unreadCountNotificationText,
          wrapper,
        },
      },
    },
  } = useTheme();

  if (!showNotification) return null;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.touchable, touchable]}>
      <View style={[styles.wrapper, wrapper]}>
        <View style={[styles.container, container]}>
          <Down />
        </View>
        {!!unreadCount && (
          <View
            style={[
              styles.unreadCountNotificationContainer,
              unreadCountNotificationContainer,
            ]}
          >
            <Text
              style={[
                styles.unreadCountNotificationText,
                unreadCountNotificationText,
              ]}
            >
              {unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

MessageNotification.displayName =
  'MessageNotification{messageList{messageNotification}}';