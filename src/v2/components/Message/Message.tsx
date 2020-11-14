import React from 'react';
import { Clipboard, GestureResponderEvent, Keyboard } from 'react-native';

import {
  ChannelContextValue,
  useChannelContext,
} from '../../contexts/channelContext/ChannelContext';
import {
  ChatContextValue,
  useChatContext,
} from '../../contexts/chatContext/ChatContext';
import {
  KeyboardContextValue,
  useKeyboardContext,
} from '../../contexts/keyboardContext/KeyboardContext';
import {
  Alignment,
  MessageContextValue,
  MessageProvider,
  Reactions,
} from '../../contexts/messageContext/MessageContext';
import {
  MessageAction,
  MessageOverlayContextValue,
  useMessageOverlayContext,
} from '../../contexts/messageOverlayContext/MessageOverlayContext';
import {
  GroupType,
  MessagesContextValue,
  useMessagesContext,
} from '../../contexts/messagesContext/MessagesContext';
import {
  OverlayContextValue,
  useOverlayContext,
} from '../../contexts/overlayContext/OverlayContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';
import {
  ThreadContextValue,
  useThreadContext,
} from '../../contexts/threadContext/ThreadContext';
import {
  TranslationContextValue,
  useTranslationContext,
} from '../../contexts/translationContext/TranslationContext';

import { Copy } from '../../icons/Copy';
import { CurveLineLeftUp } from '../../icons/CurveLineLeftUp';
import { Delete } from '../../icons/Delete';
import { Edit } from '../../icons/Edit';
import { Mute } from '../../icons/Mute';
import { SendUp } from '../../icons/SendUp';
import { ThreadReply } from '../../icons/ThreadReply';
import { UserDelete } from '../../icons/UserDelete';

import type {
  MessageResponse,
  Reaction,
  ReactionResponse,
  Message as StreamMessage,
} from 'stream-chat';

import type { Message as InsertDatesMessage } from '../MessageList/utils/insertDates';

import type {
  DefaultAttachmentType,
  DefaultChannelType,
  DefaultCommandType,
  DefaultEventType,
  DefaultMessageType,
  DefaultReactionType,
  DefaultUserType,
  UnknownType,
} from '../../types/types';

export type MessagePropsWithContext<
  At extends UnknownType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType
> = Pick<
  ChannelContextValue<At, Ch, Co, Ev, Me, Re, Us>,
  'channel' | 'disabled' | 'isAdmin' | 'isModerator' | 'isOwner'
> &
  Pick<ChatContextValue<At, Ch, Co, Ev, Me, Re, Us>, 'client'> &
  Pick<KeyboardContextValue, 'dismissKeyboard'> &
  Partial<
    Omit<
      MessageContextValue<At, Ch, Co, Ev, Me, Re, Us>,
      'groupStyles' | 'message'
    >
  > &
  Pick<
    MessageContextValue<At, Ch, Co, Ev, Me, Re, Us>,
    'groupStyles' | 'message'
  > &
  Pick<
    MessagesContextValue<At, Ch, Co, Ev, Me, Re, Us>,
    | 'dismissKeyboardOnMessageTouch'
    | 'MessageSimple'
    | 'removeMessage'
    | 'reactionsEnabled'
    | 'retrySendMessage'
    | 'setEditingState'
    | 'supportedReactions'
    | 'updateMessage'
  > &
  Pick<MessageOverlayContextValue<At, Ch, Co, Ev, Me, Re, Us>, 'setData'> &
  Pick<OverlayContextValue, 'setOverlay'> &
  Pick<ThreadContextValue<At, Ch, Co, Ev, Me, Re, Us>, 'openThread'> &
  Pick<TranslationContextValue, 't'> & {
    /**
     * Whether or not users are able to long press messages.
     */
    enableLongPress?: boolean;
    /**
     * Force alignment of message to left or right - 'left' | 'right'
     * By default, current user's messages will be aligned to right and other user's messages will be aligned to left.
     * */
    forceAlign?: Alignment | boolean;
    /** Handler to delete a current message */
    handleDelete?: () => Promise<void>;
    /**
     * Handler to edit a current message. This function sets the current message as the `editing` property of channel context.
     * The `editing` prop is used by the MessageInput component to switch to edit mode.
     */
    handleEdit?: () => void;
    /** Handler to flag the message */
    handleFlag?: () => Promise<void>;
    /** Handler to mute the user */
    handleMute?: () => Promise<void>;
    /** Handler to process a reaction */
    handleReaction?: (reactionType: string) => Promise<void>;
    /** Handler to resend the message */
    handleRetry?: () => Promise<void>;
    /**
     * Array of allowed actions on message
     * If all the actions need to be disabled an empty array should be provided as value of prop
     */
    messageActions?: MessageAction[];
    /**
     * You can call methods available on the Message
     * component such as handleEdit, handleDelete, handleAction etc.
     *
     * Source - [Message](https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/Message/Message.tsx)
     *
     * By default, we show the overlay with all the message actions on long press.
     *
     * @param message Message object which was long pressed
     * @param event   Event object for onLongPress event
     **/
    onLongPress?: (
      message: InsertDatesMessage<At, Ch, Co, Ev, Me, Re, Us>,
      event: GestureResponderEvent,
    ) => void;
    /**
     * You can call methods available on the Message
     * component such as handleEdit, handleDelete, handleAction etc.
     *
     * Source - [Message](https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/Message/Message.tsx)
     *
     * By default, we will dismiss the keyboard on press.
     *
     * @param message Message object which was long pressed
     * @param event   Event object for onLongPress event
     * */
    onPress?: (
      message: InsertDatesMessage<At, Ch, Co, Ev, Me, Re, Us>,
      event: GestureResponderEvent,
    ) => void;
    /**
     * Handler to open the thread on message. This is callback for touch event for replies button.
     *
     * @param message A message object to open the thread upon.
     */
    onThreadSelect?: (
      message: InsertDatesMessage<At, Ch, Co, Ev, Me, Re, Us>,
    ) => void;
  };

/**
 * Since this component doesn't consume `messages` from `MessagesContext`,
 * we memoized and broke it up to prevent new messages from re-rendering
 * each individual Message component.
 */
const MessageWithContext = <
  At extends UnknownType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType
>(
  props: MessagePropsWithContext<At, Ch, Co, Ev, Me, Re, Us>,
) => {
  const {
    channel,
    client,
    disabled,
    dismissKeyboard,
    dismissKeyboardOnMessageTouch,
    enableLongPress = true,
    forceAlign = false,
    groupStyles = ['bottom'],
    isAdmin,
    isModerator,
    isOwner,
    lastReceivedId,
    message,
    messageActions: messageActionsProp,
    MessageSimple,
    onLongPress: onLongPressProp,
    onPress: onPressProp,
    onThreadSelect,
    openThread,
    preventPress,
    reactionsEnabled,
    removeMessage,
    retrySendMessage,
    setData,
    setEditingState,
    setOverlay,
    showAvatar,
    showMessageStatus,
    supportedReactions,
    t,
    threadList = false,
    updateMessage,
  } = props;

  const {
    theme: {
      colors: { danger, primary },
    },
  } = useTheme();

  const actionsEnabled =
    message.type === 'regular' && message.status === 'received';

  const isMyMessage = client && message && client.userID === message.user?.id;

  const canModifyMessage = isMyMessage || isModerator || isOwner || isAdmin;

  const handleAction = async (name: string, value: string) => {
    if (message.id) {
      const data = await channel?.sendAction(message.id, { [name]: value });
      if (data?.message) {
        updateMessage(data.message);
      } else {
        removeMessage({
          id: message.id,
          parent_id: message.parent_id as StreamMessage<
            At,
            Me,
            Us
          >['parent_id'],
        });
      }
    }
  };

  const onPress = (
    error = message.type === 'error' || message.status === 'failed',
  ) => {
    if (dismissKeyboardOnMessageTouch) {
      Keyboard.dismiss();
    }
    if (error) {
      showMessageOverlay(false, true);
    }
  };

  const alignment =
    forceAlign && (forceAlign === 'left' || forceAlign === 'right')
      ? forceAlign
      : isMyMessage
      ? 'right'
      : 'left';

  const files =
    (Array.isArray(message.attachments) &&
      message.attachments.filter((item) => item.type === 'file')) ||
    [];

  const forwardedGroupStyles =
    !!reactionsEnabled &&
    message.latest_reactions &&
    message.latest_reactions.length > 0
      ? (['bottom'] as GroupType[])
      : groupStyles;

  const images =
    (Array.isArray(message.attachments) &&
      message.attachments.filter(
        (item) =>
          item.type === 'image' && !item.title_link && !item.og_scrape_url,
      )) ||
    [];

  const onOpenThread = () => {
    if (onThreadSelect) {
      onThreadSelect(message);
    }
    if (openThread) {
      openThread(message);
    }
  };

  const hasReactions =
    !!reactionsEnabled &&
    !!message.latest_reactions &&
    message.latest_reactions.length > 0;

  const clientId = client.userID;

  const reactions = hasReactions
    ? supportedReactions.reduce(
        (acc, cur) => {
          const reactionType = cur.type;
          const hasOwnReaction = (message.own_reactions as ReactionResponse<
            Re,
            Us
          >[]).some((reaction) => reaction.type === reactionType);
          const hasOtherReaction = (message.latest_reactions as ReactionResponse<
            Re,
            Us
          >[]).some(
            (reaction) =>
              reaction.type === reactionType && reaction.user_id !== clientId,
          );
          if (hasOwnReaction) {
            if (hasOtherReaction) {
              acc.latestReactions.push({ own: true, type: reactionType });
            } else {
              acc.ownReactions.push(reactionType);
            }
          } else {
            if (hasOtherReaction) {
              acc.latestReactions.push({ own: false, type: reactionType });
            }
          }

          return acc;
        },
        { latestReactions: [], ownReactions: [] } as Reactions,
      )
    : { latestReactions: [], ownReactions: [] };

  const showMessageOverlay = async (
    messageReactions = false,
    error = message.type === 'error' || message.status === 'failed',
  ) => {
    await dismissKeyboard();

    const blockUser = {
      action: () => async () => {
        if (message.user?.id) {
          await client.banUser(message.user.id);
        }
      },
      icon: <UserDelete />,
      title: t('Block User'),
    };

    const copyMessage = {
      // using depreciated Clipboard from react-native until expo supports the community version or their own
      action: () => Clipboard.setString(message.text || ''),
      icon: <Copy />,
      title: t('Copy Message'),
    };

    const deleteMessage = {
      action: async () => {
        if (message.id) {
          const data = await client.deleteMessage(message.id);
          updateMessage(data.message);
        }
      },
      icon: <Delete pathFill={danger} />,
      title: t('Delete Message'),
      titleStyle: { color: danger },
    };

    const editMessage = {
      action: () => setEditingState(message),
      icon: <Edit />,
      title: t('Edit Message'),
    };

    const handleReaction = !error
      ? async (reactionType: string) => {
          const messageId = message.id;
          const ownReaction =
            reactions.ownReactions.includes(reactionType) ||
            !!reactions.latestReactions.find(
              (reaction) => reaction.own && reaction.type === reactionType,
            );

          // Change reaction in local state, make API call in background, revert to old message if fails
          try {
            if (channel && messageId) {
              if (ownReaction) {
                await channel.deleteReaction(messageId, reactionType);
              } else {
                await channel.sendReaction(messageId, {
                  type: reactionType,
                } as Reaction<Re, Us>);
              }
            }
          } catch (err) {
            console.log(err);
          }
        }
      : undefined;

    const muteUser = {
      action: async () => {
        if (message.user?.id) {
          await client.muteUser(message.user.id);
        }
      },
      icon: <Mute />,
      title: t('Mute User'),
    };

    const reply = {
      action: onOpenThread,
      icon: <CurveLineLeftUp />,
      title: t('Reply'),
    };

    const threadReply = {
      action: onOpenThread,
      icon: <ThreadReply />,
      title: t('Thread Reply'),
    };

    setData({
      alignment,
      clientId: client.userID,
      groupStyles,
      handleReaction,
      message,
      messageActions: error
        ? messageActionsProp || [
            {
              action: async () =>
                await retrySendMessage(
                  message as MessageResponse<At, Ch, Co, Me, Re, Us>,
                ),
              icon: <SendUp pathFill={primary} />,
              title: t('Resend'),
            },
            editMessage,
            deleteMessage,
          ]
        : messageReactions
        ? undefined
        : messageActionsProp || canModifyMessage
        ? message.text
          ? [reply, threadReply, editMessage, copyMessage, deleteMessage]
          : [reply, threadReply, editMessage, deleteMessage]
        : message.text
        ? [reply, threadReply, copyMessage, muteUser, blockUser, deleteMessage]
        : [reply, threadReply, muteUser, blockUser, deleteMessage],
      messageReactionTitle:
        !error && messageReactions ? t('Message Reactions') : undefined,
      supportedReactions,
    });

    setOverlay('message');
  };

  const messageContext = {
    actionsEnabled,
    alignment,
    canModifyMessage,
    files,
    groupStyles: forwardedGroupStyles,
    handleAction,
    hasReactions,
    images,
    isMyMessage,
    lastGroupMessage:
      forwardedGroupStyles[0] === 'single' ||
      forwardedGroupStyles[0] === 'bottom',
    lastReceivedId,
    message,
    onLongPress:
      onLongPressProp && !disabled
        ? (event: GestureResponderEvent) => onLongPressProp(message, event)
        : enableLongPress
        ? () => showMessageOverlay(false)
        : () => null,
    onOpenThread,
    onPress: onPressProp
      ? (event: GestureResponderEvent) => onPressProp(message, event)
      : () => onPress(),
    preventPress,
    reactions,
    showAvatar,
    showMessageOverlay,
    showMessageStatus:
      typeof showMessageStatus === 'boolean' ? showMessageStatus : isMyMessage,
    threadList,
  };

  return (
    <MessageProvider value={messageContext}>
      <MessageSimple />
    </MessageProvider>
  );
};

const areEqual = <
  At extends UnknownType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType
>(
  prevProps: MessagePropsWithContext<At, Ch, Co, Ev, Me, Re, Us>,
  nextProps: MessagePropsWithContext<At, Ch, Co, Ev, Me, Re, Us>,
) => {
  const {
    lastReceivedId: prevLastReceivedId,
    message: prevMessage,
  } = prevProps;
  const {
    lastReceivedId: nextLastReceivedId,
    message: nextMessage,
  } = nextProps;

  const repliesEqual = prevMessage.reply_count === nextMessage.reply_count;
  if (!repliesEqual) return false;

  const lastReceivedIdChangedAndMatters =
    prevLastReceivedId !== nextLastReceivedId &&
    (prevLastReceivedId === prevMessage.id ||
      prevLastReceivedId === nextMessage.id ||
      nextLastReceivedId === prevMessage.id ||
      nextLastReceivedId === nextMessage.id);
  if (!lastReceivedIdChangedAndMatters) return false;

  const messageEqual =
    prevMessage.deleted_at === nextMessage.deleted_at &&
    prevMessage.status === nextMessage.status &&
    prevMessage.type === nextMessage.type &&
    prevMessage.updated_at === nextMessage.update_at;
  if (!messageEqual) return false;

  const attachmentsEqual =
    Array.isArray(prevMessage.attachments) ===
      Array.isArray(nextMessage.attachments) &&
    ((Array.isArray(prevMessage.attachments) &&
      Array.isArray(nextMessage.attachments) &&
      prevMessage.attachments.length === nextMessage.attachments.length) ||
      prevMessage.attachments === nextMessage.attachments);
  if (!attachmentsEqual) return false;

  const latestReactionsEqual =
    Array.isArray(prevMessage.latest_reactions) ===
      Array.isArray(nextMessage.latest_reactions) &&
    ((Array.isArray(prevMessage.latest_reactions) &&
      Array.isArray(nextMessage.latest_reactions) &&
      prevMessage.latest_reactions.length ===
        nextMessage.latest_reactions.length) ||
      prevMessage.latest_reactions === nextMessage.latest_reactions);
  if (!latestReactionsEqual) return false;

  return true;
};

const MemoizedMessage = React.memo(
  MessageWithContext,
  areEqual,
) as typeof MessageWithContext;

export type MessageProps<
  At extends UnknownType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType
> = Partial<
  Omit<
    MessagePropsWithContext<At, Ch, Co, Ev, Me, Re, Us>,
    'groupStyles' | 'message'
  >
> &
  Pick<
    MessagePropsWithContext<At, Ch, Co, Ev, Me, Re, Us>,
    'groupStyles' | 'message'
  >;

/**
 * Message - A high level component which implements all the logic required for a message.
 * The actual rendering of the message is delegated via the "Message" property
 *
 * @example ./Message.md
 */
export const Message = <
  At extends UnknownType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType
>(
  props: MessageProps<At, Ch, Co, Ev, Me, Re, Us>,
) => {
  const {
    channel,
    disabled,
    isAdmin,
    isModerator,
    isOwner,
  } = useChannelContext<At, Ch, Co, Ev, Me, Re, Us>();
  const { client } = useChatContext<At, Ch, Co, Ev, Me, Re, Us>();
  const { dismissKeyboard } = useKeyboardContext();
  const { setData } = useMessageOverlayContext<At, Ch, Co, Ev, Me, Re, Us>();
  const {
    dismissKeyboardOnMessageTouch,
    MessageSimple,
    reactionsEnabled,
    removeMessage,
    retrySendMessage,
    setEditingState,
    supportedReactions,
    updateMessage,
  } = useMessagesContext<At, Ch, Co, Ev, Me, Re, Us>();
  const { setOverlay } = useOverlayContext();
  const { openThread } = useThreadContext<At, Ch, Co, Ev, Me, Re, Us>();
  const { t } = useTranslationContext();

  return (
    <MemoizedMessage<At, Ch, Co, Ev, Me, Re, Us>
      {...{
        channel,
        client,
        disabled,
        dismissKeyboard,
        dismissKeyboardOnMessageTouch,
        isAdmin,
        isModerator,
        isOwner,
        MessageSimple,
        openThread,
        reactionsEnabled,
        removeMessage,
        retrySendMessage,
        setData,
        setEditingState,
        setOverlay,
        supportedReactions,
        t,
        updateMessage,
      }}
      {...props}
    />
  );
};
