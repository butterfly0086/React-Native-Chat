import React, { useState } from 'react';
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';

import { FileIcon as FileIconDefault } from '../Attachment/FileIcon';
import { MessageAvatar as MessageAvatarDefault } from '../Message/MessageSimple/MessageAvatar';
import { MessageTextContainer } from '../Message/MessageSimple/MessageTextContainer';

import { useMessageContext } from '../../contexts/messageContext/MessageContext';
import {
  MessagesContextValue,
  useMessagesContext,
} from '../../contexts/messagesContext/MessagesContext';
import {
  MessageInputContextValue,
  useMessageInputContext,
} from '../../contexts/messageInputContext/MessageInputContext';
import {
  TranslationContextValue,
  useTranslationContext,
} from '../../contexts/translationContext/TranslationContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';

import type { Attachment as AttachmentType } from 'stream-chat';

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

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  fileAttachmentContainer: { paddingLeft: 8, paddingVertical: 8 },
  imageAttachment: {
    borderRadius: 8,
    height: 32,
    marginLeft: 8,
    marginVertical: 8,
    width: 32,
  },
  messageContainer: {
    alignItems: 'flex-start',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
  },
  text: { fontSize: 12 },
  textContainer: { maxWidth: undefined, paddingHorizontal: 8 },
});

type ReplyPropsWithContext<
  At extends DefaultAttachmentType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType
> = Pick<
  MessageInputContextValue<At, Ch, Co, Ev, Me, Re, Us>,
  'replyToMessage'
> &
  Pick<
    MessagesContextValue<At, Ch, Co, Ev, Me, Re, Us>,
    'AttachmentFileIcon' | 'MessageAvatar'
  > &
  Pick<TranslationContextValue, 't'> & {
    attachmentSize?: number;
    styles?: Partial<{
      container: ViewStyle;
      fileAttachmentContainer: ViewStyle;
      imageAttachment: ImageStyle;
      messageContainer: ViewStyle;
      textContainer: ViewStyle;
    }>;
  };

export const ReplyWithContext = <
  At extends DefaultAttachmentType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends DefaultUserType = DefaultUserType
>(
  props: ReplyPropsWithContext<At, Ch, Co, Ev, Me, Re, Us>,
) => {
  const {
    AttachmentFileIcon,
    attachmentSize = 40,
    MessageAvatar,
    replyToMessage,
    styles: stylesProp = {},
    t,
  } = props;

  const [error, setError] = useState(false);

  const {
    theme: {
      colors: { blue_alice, border, transparent, white },
      reply: {
        container,
        fileAttachmentContainer,
        imageAttachment,
        markdownStyles,
        messageContainer,
        textContainer,
      },
    },
  } = useTheme();

  if (typeof replyToMessage === 'boolean') return null;

  const lastAttachment =
    replyToMessage.attachments &&
    (replyToMessage.attachments.slice(-1)[0] as AttachmentType<At>);

  const messageType = lastAttachment
    ? lastAttachment.type === 'file' || lastAttachment.type === 'audio'
      ? 'file'
      : lastAttachment.type === 'image' &&
        !lastAttachment.title_link &&
        !lastAttachment.og_scrape_url
      ? lastAttachment.image_url || lastAttachment.thumb_url
        ? 'image'
        : undefined
      : lastAttachment.type === 'giphy' || lastAttachment.type === 'imgur'
      ? 'giphy'
      : 'other'
    : undefined;

  const hasImage =
    !error &&
    lastAttachment &&
    messageType !== 'file' &&
    (lastAttachment.image_url ||
      lastAttachment.thumb_url ||
      lastAttachment.og_scrape_url);

  return (
    <View style={[styles.container, container, stylesProp.container]}>
      <MessageAvatar
        alignment={'left'}
        lastGroupMessage
        message={replyToMessage}
        size={24}
      />
      <View
        style={[
          styles.messageContainer,
          {
            backgroundColor:
              messageType === 'other'
                ? blue_alice
                : messageType === 'giphy'
                ? transparent
                : white,
            borderColor: border,
            borderWidth: messageType === 'other' ? 0 : 1,
          },
          messageContainer,
          stylesProp.messageContainer,
        ]}
      >
        {!error && lastAttachment ? (
          messageType === 'file' ? (
            <View
              style={[
                styles.fileAttachmentContainer,
                fileAttachmentContainer,
                stylesProp.fileAttachmentContainer,
              ]}
            >
              <AttachmentFileIcon
                mimeType={lastAttachment.mime_type}
                size={attachmentSize}
              />
            </View>
          ) : hasImage ? (
            <Image
              onError={() => setError(true)}
              source={{
                uri:
                  lastAttachment.image_url ||
                  lastAttachment.thumb_url ||
                  lastAttachment.og_scrape_url,
              }}
              style={[
                styles.imageAttachment,
                imageAttachment,
                stylesProp.imageAttachment,
              ]}
            />
          ) : null
        ) : null}
        <MessageTextContainer<At, Ch, Co, Ev, Me, Re, Us>
          markdownStyles={{ text: styles.text, ...markdownStyles }}
          message={{
            ...replyToMessage,
            text: replyToMessage.text
              ? replyToMessage.text.length > 170
                ? `${replyToMessage.text.slice(0, 170)}...`
                : replyToMessage.text
              : messageType === 'image'
              ? t('Photo')
              : messageType === 'file'
              ? lastAttachment?.title || ''
              : '',
          }}
          styles={{
            textContainer: [
              {
                marginRight: hasImage
                  ? Number(
                      stylesProp.imageAttachment?.height ||
                        imageAttachment.height ||
                        styles.imageAttachment.height,
                    ) +
                    Number(
                      stylesProp.imageAttachment?.marginLeft ||
                        imageAttachment.marginLeft ||
                        styles.imageAttachment.marginLeft,
                    )
                  : messageType === 'file'
                  ? attachmentSize +
                    Number(
                      stylesProp.fileAttachmentContainer?.paddingLeft ||
                        fileAttachmentContainer.paddingLeft ||
                        styles.fileAttachmentContainer.paddingLeft,
                    )
                  : undefined,
              },
              styles.textContainer,
              textContainer,
              stylesProp.textContainer,
            ],
          }}
        />
      </View>
    </View>
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
  prevProps: ReplyPropsWithContext<At, Ch, Co, Ev, Me, Re, Us>,
  nextProps: ReplyPropsWithContext<At, Ch, Co, Ev, Me, Re, Us>,
) => {
  const { replyToMessage: prevReplyToMessage } = prevProps;
  const { replyToMessage: nextReplyToMessage } = nextProps;

  const replyToMessageEqual =
    !!prevReplyToMessage &&
    !!nextReplyToMessage &&
    typeof prevReplyToMessage !== 'boolean' &&
    typeof nextReplyToMessage !== 'boolean'
      ? prevReplyToMessage.id === nextReplyToMessage.id
      : !!prevReplyToMessage === !!nextReplyToMessage;
  if (!replyToMessageEqual) return false;

  return true;
};

const MemoizedReply = React.memo(
  ReplyWithContext,
  areEqual,
) as typeof ReplyWithContext;

export type ReplyProps<
  At extends DefaultAttachmentType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType
> = Partial<ReplyPropsWithContext<At, Ch, Co, Ev, Me, Re, Us>>;

/**
 * UI Component for reply
 *
 * @example ./Reply.md
 */
export const Reply = <
  At extends DefaultAttachmentType = DefaultAttachmentType,
  Ch extends UnknownType = DefaultChannelType,
  Co extends string = DefaultCommandType,
  Ev extends UnknownType = DefaultEventType,
  Me extends UnknownType = DefaultMessageType,
  Re extends UnknownType = DefaultReactionType,
  Us extends UnknownType = DefaultUserType
>(
  props: ReplyProps<At, Ch, Co, Ev, Me, Re, Us>,
) => {
  const { message } = useMessageContext<At, Ch, Co, Ev, Me, Re, Us>();

  const {
    AttachmentFileIcon = FileIconDefault,
    MessageAvatar = MessageAvatarDefault,
  } = useMessagesContext<At, Ch, Co, Ev, Me, Re, Us>();

  const { replyToMessage } = useMessageInputContext<
    At,
    Ch,
    Co,
    Ev,
    Me,
    Re,
    Us
  >();

  const { t } = useTranslationContext();

  return (
    <MemoizedReply
      {...{
        AttachmentFileIcon,
        MessageAvatar,
        replyToMessage: message
          ? (message.reply_to_message as MessageInputContextValue<
              At,
              Ch,
              Co,
              Ev,
              Me,
              Re,
              Us
            >['replyToMessage'])
          : replyToMessage,
        t,
      }}
      {...props}
    />
  );
};

Reply.displayName = 'Reply{reply}';
