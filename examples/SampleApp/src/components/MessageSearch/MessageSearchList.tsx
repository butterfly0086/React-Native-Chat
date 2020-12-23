import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import dayjs from 'dayjs';
import { Avatar } from 'stream-chat-react-native/v2';
import {
  AppTheme,
  LocalAttachmentType,
  LocalChannelType,
  LocalCommandType,
  LocalMessageType,
  LocalReactionType,
  LocalUserType,
} from '../../types';
import { MessageResponse } from 'stream-chat';

export type MessageSearchListProps = {
  EmptySearchIndicator: React.Component;
  loadMore: () => void;
  messages: MessageResponse<
    LocalAttachmentType,
    LocalChannelType,
    LocalCommandType,
    LocalMessageType,
    LocalReactionType,
    LocalUserType
  >[];
  refreshing: boolean;
  refreshList: () => void;
  showResultCount?: boolean;
};
export const MessageSearchList: React.FC<MessageSearchListProps> = ({
  EmptySearchIndicator,
  loading,
  loadMore,
  messages,
  refreshing,
  refreshList,
  showResultCount = false,
}) => {
  const { colors } = useTheme() as AppTheme;
  const navigation = useNavigation();

  if (loading && !refreshing && (!messages || messages.length === 0)) {
    return (
      <View
        style={{
          alignItems: 'center',
          height: '100%',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size={'small'} />
      </View>
    );
  }
  if (!messages && !refreshing) return null;

  return (
    <>
      {showResultCount && (
        <View
          style={{
            backgroundColor: colors.greyContentBackground,
            paddingHorizontal: 10,
            paddingVertical: 2,
          }}
        >
          <Text>{messages.length} results</Text>
        </View>
      )}
      <FlatList
        data={messages}
        ListEmptyComponent={EmptySearchIndicator}
        onEndReached={loadMore}
        onRefresh={refreshList}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ChannelScreen', {
                channelId: item.channel?.id,
                messageId: item.id,
              });
            }}
            style={{
              borderBottomColor: colors.borderLight,
              borderBottomWidth: 1,
              flexDirection: 'row',
              padding: 12,
            }}
          >
            <View style={{ flexDirection: 'row', flexGrow: 1, flexShrink: 1 }}>
              <Avatar
                image={item.user?.image}
                name={item.user?.name}
                size={40}
              />
              <View
                style={{
                  flexGrow: 1,
                  flexShrink: 1,
                  marginLeft: 10,
                  marginRight: 20,
                }}
              >
                <Text style={{ color: colors.text }}>
                  <Text style={{ fontWeight: '700' }}>{item.user?.name} </Text>
                  in
                  <Text style={{ fontWeight: '700' }}>
                    {' '}
                    {item.channel?.name}
                  </Text>
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.textLight,
                    flexWrap: 'nowrap',
                    fontSize: 12,
                    fontWeight: '400',
                  }}
                >
                  {item.text}
                </Text>
              </View>
            </View>
            <View>
              <Text
                style={{
                  color: colors.textLight,
                  fontSize: 12,
                }}
              >
                {dayjs(item.created_at).calendar(null, {
                  lastDay: 'DD/MM', // The day before ( Yesterday at 2:30 AM )
                  lastWeek: 'DD/MM', // Last week ( Last Monday at 2:30 AM )
                  sameDay: 'h:mm A', // The same day ( Today at 2:30 AM )
                  sameElse: 'DD/MM/YYYY', // Everything else ( 17/10/2011 )
                })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </>
  );
};