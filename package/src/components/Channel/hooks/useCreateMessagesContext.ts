import { useMemo } from 'react';

import type { MessagesContextValue } from '../../../contexts/messagesContext/MessagesContext';
import type { DefaultStreamChatGenerics } from '../../../types/types';

export const useCreateMessagesContext = <
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
>({
  additionalTouchableProps,
  addReaction,
  Attachment,
  AttachmentActions,
  AudioAttachment,
  Card,
  CardCover,
  CardFooter,
  CardHeader,
  channelId,
  DateHeader,
  deletedMessagesVisibilityType,
  disableTypingIndicator,
  dismissKeyboardOnMessageTouch,
  enableMessageGroupingByUser,
  FileAttachment,
  FileAttachmentGroup,
  FileAttachmentIcon,
  FlatList,
  forceAlignMessages,
  formatDate,
  Gallery,
  getMessagesGroupStyles,
  Giphy,
  giphyVersion,
  handleBlock,
  handleCopy,
  handleDelete,
  handleEdit,
  handleFlag,
  handleMute,
  handlePinMessage,
  handleQuotedReply,
  handleReaction,
  handleRetry,
  handleThreadReply,
  ImageLoadingFailedIndicator,
  ImageLoadingIndicator,
  initialScrollToFirstUnreadMessage,
  InlineDateSeparator,
  InlineUnreadIndicator,
  isAttachmentEqual,
  legacyImageViewerSwipeBehaviour,
  markdownRules,
  Message,
  messageActions,
  MessageAvatar,
  MessageContent,
  messageContentOrder,
  MessageDeleted,
  MessageFooter,
  MessageHeader,
  MessageList,
  MessagePinnedHeader,
  MessageReplies,
  MessageRepliesAvatars,
  MessageSimple,
  MessageStatus,
  MessageSystem,
  MessageText,
  myMessageTheme,
  onLongPressMessage,
  onPressInMessage,
  onPressMessage,
  OverlayReactionList,
  ReactionList,
  removeMessage,
  removeReaction,
  Reply,
  retrySendMessage,
  ScrollToBottomButton,
  selectReaction,
  setEditingState,
  setQuotedMessageState,
  supportedReactions,
  targetedMessage,
  TypingIndicator,
  TypingIndicatorContainer,
  updateMessage,
  UrlPreview,
  VideoThumbnail,
}: MessagesContextValue<StreamChatGenerics> & {
  /**
   * To ensure we allow re-render, when channel is changed
   */
  channelId?: string;
}) => {
  const additionalTouchablePropsLength = Object.keys(additionalTouchableProps || {}).length;
  const markdownRulesLength = Object.keys(markdownRules || {}).length;
  const messageContentOrderValue = messageContentOrder.join();
  const supportedReactionsLength = supportedReactions.length;

  const messagesContext: MessagesContextValue<StreamChatGenerics> = useMemo(
    () => ({
      additionalTouchableProps,
      addReaction,
      Attachment,
      AttachmentActions,
      AudioAttachment,
      Card,
      CardCover,
      CardFooter,
      CardHeader,
      DateHeader,
      deletedMessagesVisibilityType,
      disableTypingIndicator,
      dismissKeyboardOnMessageTouch,
      enableMessageGroupingByUser,
      FileAttachment,
      FileAttachmentGroup,
      FileAttachmentIcon,
      FlatList,
      forceAlignMessages,
      formatDate,
      Gallery,
      getMessagesGroupStyles,
      Giphy,
      giphyVersion,
      handleBlock,
      handleCopy,
      handleDelete,
      handleEdit,
      handleFlag,
      handleMute,
      handlePinMessage,
      handleQuotedReply,
      handleReaction,
      handleRetry,
      handleThreadReply,
      ImageLoadingFailedIndicator,
      ImageLoadingIndicator,
      initialScrollToFirstUnreadMessage,
      InlineDateSeparator,
      InlineUnreadIndicator,
      isAttachmentEqual,
      legacyImageViewerSwipeBehaviour,
      markdownRules,
      Message,
      messageActions,
      MessageAvatar,
      MessageContent,
      messageContentOrder,
      MessageDeleted,
      MessageFooter,
      MessageHeader,
      MessageList,
      MessagePinnedHeader,
      MessageReplies,
      MessageRepliesAvatars,
      MessageSimple,
      MessageStatus,
      MessageSystem,
      MessageText,
      myMessageTheme,
      onLongPressMessage,
      onPressInMessage,
      onPressMessage,
      OverlayReactionList,
      ReactionList,
      removeMessage,
      removeReaction,
      Reply,
      retrySendMessage,
      ScrollToBottomButton,
      selectReaction,
      setEditingState,
      setQuotedMessageState,
      supportedReactions,
      targetedMessage,
      TypingIndicator,
      TypingIndicatorContainer,
      updateMessage,
      UrlPreview,
      VideoThumbnail,
    }),
    [
      additionalTouchablePropsLength,
      channelId,
      disableTypingIndicator,
      dismissKeyboardOnMessageTouch,
      initialScrollToFirstUnreadMessage,
      markdownRulesLength,
      addReaction,
      removeReaction,
      messageContentOrderValue,
      supportedReactionsLength,
      targetedMessage,
    ],
  );

  return messagesContext;
};
