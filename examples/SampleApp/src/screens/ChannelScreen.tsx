import React, { useContext, useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  Channel,
  getChannelPreviewDisplayAvatar,
  GroupAvatar,
  MessageInput,
  MessageList,
  Spinner,
  ThreadContextValue,
  useChannelPreviewDisplayName,
  useChatContext,
  useTheme,
  useTypingString,
} from 'stream-chat-react-native';

import { ScreenHeader } from '../components/ScreenHeader';
import { AppContext } from '../context/AppContext';
import { useChannelMembersStatus } from '../hooks/useChannelMembersStatus';

import type { StackNavigationProp } from '@react-navigation/stack';
import type { Channel as StreamChatChannel } from 'stream-chat';

import type {
  LocalAttachmentType,
  LocalChannelType,
  LocalCommandType,
  LocalEventType,
  LocalMessageType,
  LocalReactionType,
  LocalUserType,
  StackNavigatorParamList,
} from '../types';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  networkDownIndicatorContainer: { alignItems: 'center', flexDirection: 'row' },
  searchingForNetworkText: {
    paddingLeft: 8,
  },
});

export type ChannelScreenNavigationProp = StackNavigationProp<
  StackNavigatorParamList,
  'ChannelScreen'
>;
export type ChannelScreenRouteProp = RouteProp<
  StackNavigatorParamList,
  'ChannelScreen'
>;
export type ChannelScreenProps = {
  navigation: ChannelScreenNavigationProp;
  route: ChannelScreenRouteProp;
};

export type ChannelHeaderProps = {
  channel: StreamChatChannel<
    LocalAttachmentType,
    LocalChannelType,
    LocalCommandType,
    LocalEventType,
    LocalMessageType,
    LocalReactionType,
    LocalUserType
  >;
};

export const NetworkDownIndicator = () => {
  const {
    theme: {
      colors: { grey },
    },
  } = useTheme();
  return (
    <View style={styles.networkDownIndicatorContainer}>
      <Spinner />
      <Text
        style={
          (styles.searchingForNetworkText,
          [
            {
              color: grey,
            },
          ])
        }
      >
        Searching for network
      </Text>
    </View>
  );
};

const ChannelHeader: React.FC<ChannelHeaderProps> = ({ channel }) => {
  const membersStatus = useChannelMembersStatus(channel);
  const displayName = useChannelPreviewDisplayName(channel, 30);
  const { isOnline } = useChatContext();
  const { chatClient } = useContext(AppContext);
  const navigation = useNavigation<ChannelScreenNavigationProp>();
  const typing = useTypingString();

  if (!channel || !chatClient) return null;

  const displayAvatar = getChannelPreviewDisplayAvatar(channel, chatClient);

  const isOneOnOneConversation =
    channel &&
    Object.values(channel.state.members).length === 2 &&
    channel.id?.indexOf('!members-') === 0;

  return (
    <ScreenHeader
      RightContent={() => (
        <TouchableOpacity
          onPress={() => {
            if (isOneOnOneConversation) {
              navigation.navigate('OneOnOneChannelDetailScreen', {
                channel,
              });
            } else {
              navigation.navigate('GroupChannelDetailsScreen', {
                channel,
              });
            }
          }}
        >
          {displayAvatar.images ? (
            <GroupAvatar
              images={displayAvatar.images}
              names={displayAvatar.names}
              size={40}
            />
          ) : (
            <Avatar
              image={displayAvatar.image}
              name={displayAvatar.name}
              size={40}
            />
          )}
        </TouchableOpacity>
      )}
      showUnreadCountBadge
      Subtitle={isOnline ? undefined : NetworkDownIndicator}
      subtitleText={typing ? typing : membersStatus}
      titleText={displayName}
    />
  );
};

// Either provide channel or channelId.
export const ChannelScreen: React.FC<ChannelScreenProps> = ({
  route: {
    params: { channel: channelFromProp, channelId, messageId },
  },
}) => {
  const { chatClient } = useContext(AppContext);
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  const {
    theme: {
      colors: { white },
    },
  } = useTheme();

  const [channel, setChannel] = useState<
    | StreamChatChannel<
        LocalAttachmentType,
        LocalChannelType,
        LocalCommandType,
        LocalEventType,
        LocalMessageType,
        LocalReactionType,
        LocalUserType
      >
    | undefined
  >(channelFromProp);

  const [selectedThread, setSelectedThread] = useState<
    ThreadContextValue<
      LocalAttachmentType,
      LocalChannelType,
      LocalCommandType,
      LocalEventType,
      LocalMessageType,
      LocalReactionType,
      LocalUserType
    >['thread']
  >();

  useEffect(() => {
    const initChannel = async () => {
      if (!chatClient || !channelId) return;

      const newChannel = chatClient?.channel('messaging', channelId);

      if (!newChannel?.initialized) {
        await newChannel?.watch();
      }
      setChannel(newChannel);
    };

    initChannel();
  }, [channelId]);

  useFocusEffect(() => {
    setSelectedThread(undefined);
  });

  if (!channel || !chatClient) return null;

  return (
    <View
      style={[styles.flex, { backgroundColor: white, paddingBottom: bottom }]}
    >
      <Channel
        channel={channel}
        disableTypingIndicator
        enforceUniqueReaction
        initialScrollToFirstUnreadMessage
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -300}
        messageId={messageId}
        thread={selectedThread}
      >
        <ChannelHeader channel={channel} />
        <MessageList<
          LocalAttachmentType,
          LocalChannelType,
          LocalCommandType,
          LocalEventType,
          LocalMessageType,
          LocalReactionType,
          LocalUserType
        >
          onThreadSelect={(thread) => {
            setSelectedThread(thread);
            navigation.navigate('ThreadScreen', {
              channel,
              thread,
            });
          }}
        />
        <MessageInput />
      </Channel>
    </View>
  );
};
