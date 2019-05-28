import React from 'react';
import { Dimensions, Text } from 'react-native';
import moment from 'moment';
import { MessageContentContext } from '../../context';
import styled from '@stream-io/styled-components';
import { themed } from '../../styles/theme';
import { REACTION_PICKER_HEIGHT } from '../../styles/styles.js';
import { Attachment } from '../Attachment';
import { ReactionList } from '../ReactionList';
import { ReactionPicker } from '../ReactionPicker';
import { ActionSheetCustom as ActionSheet } from 'react-native-actionsheet';
import { MessageText } from './MessageText';
import { MessageReplies } from './MessageReplies';
import { Gallery } from '../Gallery';
import { MESSAGE_ACTIONS } from '../../utils';
import Immutable from 'seamless-immutable';

const Container = styled.TouchableOpacity`
  display: ${({ theme }) => theme.messageContent.container.display};
  flex-direction: ${({ theme }) =>
    theme.messageContent.container.flexDirection};
  max-width: ${({ theme }) => theme.messageContent.container.maxWidth};
  align-items: ${({ theme, alignment }) =>
    alignment === 'left'
      ? theme.messageContent.container.leftAlignItems
      : theme.messageContent.container.rightAlignItems};
  justify-content: ${({ theme, alignment }) =>
    alignment === 'left'
      ? theme.messageContent.container.leftJustifyContent
      : theme.messageContent.container.rightJustifyContent};
  ${({ theme }) => theme.messageContent.container.extra}
`;

const ContainerInner = styled.View`
  align-items: ${({ theme }) => theme.messageContent.containerInner.alignItems};
  ${({ theme }) => theme.messageContent.containerInner.extra}
`;

const MetaContainer = styled.View`
  margin-top: ${({ theme }) => theme.messageContent.metaContainer.marginTop};
  ${({ theme }) => theme.messageContent.metaContainer.extra}
`;

const MetaText = styled.Text`
  font-size: ${({ theme }) => theme.messageContent.metaText.fontSize};
  color: ${({ theme }) => theme.messageContent.metaText.color};
  text-align: ${({ theme, alignment }) =>
    alignment === 'left'
      ? theme.messageContent.metaText.leftTextAlign
      : theme.messageContent.metaText.rightTextAlign};
  ${({ theme }) => theme.messageContent.metaText.extra}
`;

const DeletedContainer = styled.View`
  display: ${({ theme }) => theme.messageContent.deletedContainer.display};
  flex-direction: ${({ theme }) =>
    theme.messageContent.deletedContainer.flexDirection};
  max-width: ${({ theme }) => theme.messageContent.deletedContainer.maxWidth};
  padding: ${({ theme }) => theme.messageContent.deletedContainer.padding}px;
  align-items: ${({ theme, alignment }) =>
    alignment === 'left'
      ? theme.messageContent.deletedContainer.leftAlignItems
      : theme.messageContent.deletedContainer.rightAlignItems};
  justify-content: ${({ theme, alignment }) =>
    alignment === 'left'
      ? theme.messageContent.deletedContainer.leftJustifyContent
      : theme.messageContent.deletedContainer.rightJustifyContent};
  ${({ theme }) => theme.messageContent.deletedContainer.extra}
`;

const DeletedText = styled.Text`
  font-size: ${({ theme }) => theme.messageContent.deletedText.fontSize};
  line-height: ${({ theme }) => theme.messageContent.deletedText.lineHeight};
  color: ${({ theme }) => theme.messageContent.deletedText.color};
  ${({ theme }) => theme.messageContent.deletedText.extra}
`;

const FailedText = styled.Text``;

export const MessageContent = themed(
  class MessageContent extends React.PureComponent {
    static themePath = 'messageContent';
    constructor(props) {
      super(props);

      this.ActionSheet = false;
      this.state = { reactionPickerVisible: false };
    }

    openThread = () => {
      if (this.props.onThreadSelect)
        this.props.onThreadSelect(this.props.message);
    };

    onMessageTouch = () => {
      this.props.onMessageTouch(this.props.message.id);
    };

    showActionSheet = () => {
      this.ActionSheet.show();
    };

    handleDelete = async () => {
      await this.props.Message.handleDelete();
    };

    handleEdit = () => {
      this.props.Message.handleEdit();
    };

    _setReactionPickerPosition = () => {
      const { isMyMessage, message } = this.props;
      const pos = isMyMessage(message) ? 'right' : 'left';
      this.messageContainer.measureInWindow((x, y, width) => {
        this.setState({
          reactionPickerVisible: true,
          rpTop: y - REACTION_PICKER_HEIGHT,
          rpLeft: pos === 'left' ? x : null,
          rpRight:
            pos === 'right'
              ? Math.round(Dimensions.get('window').width) - (x + width)
              : null,
        });
      });
    };

    openReactionSelector = async () => {
      // Keyboard closes automatically whenever modal is opened (currently there is no way of avoiding this afaik)
      // So we need to postpone the calculation for reaction picker position
      // until after keyboard is closed completely. To achieve this, we close
      // the keyboard forcefully and then calculate position of picker in callback.
      await this.props.dismissKeyboard();
      this._setReactionPickerPosition();
    };

    onActionPress = (action) => {
      switch (action) {
        case MESSAGE_ACTIONS.edit:
          this.handleEdit();
          break;
        case MESSAGE_ACTIONS.delete:
          this.handleDelete();
          break;
        case MESSAGE_ACTIONS.reply:
          this.openThread();
          break;
        case MESSAGE_ACTIONS.reactions:
          this.openReactionSelector();
          break;
        default:
          break;
      }
    };

    render() {
      const {
        message,
        isMyMessage,
        readOnly,
        Message,
        handleReaction,
        threadList,
        retrySendMessage,
        messageActions,
        groupStyles,
      } = this.props;
      const hasAttachment = Boolean(
        message && message.attachments && message.attachments.length,
      );

      const pos = isMyMessage(message) ? 'right' : 'left';

      const showTime =
        groupStyles[0] === 'single' || groupStyles[0] === 'bottom'
          ? true
          : false;

      const options = [{ id: 'cancel', title: 'Cancel' }];
      const images =
        hasAttachment &&
        message.attachments.filter((item) => item.type === 'image');

      if (
        messageActions &&
        messageActions.indexOf(MESSAGE_ACTIONS.reactions) > -1
      ) {
        options.splice(1, 0, {
          id: MESSAGE_ACTIONS.reactions,
          title: 'Add Reaction',
        });
      }

      if (
        messageActions &&
        messageActions.indexOf(MESSAGE_ACTIONS.reply) > -1 &&
        !threadList
      ) {
        options.splice(1, 0, { id: MESSAGE_ACTIONS.reply, title: 'Reply' });
      }
      if (
        messageActions &&
        messageActions.indexOf(MESSAGE_ACTIONS.edit) > -1 &&
        Message.canEditMessage()
      )
        options.splice(1, 0, {
          id: MESSAGE_ACTIONS.edit,
          title: 'Edit Message',
        });

      if (
        messageActions &&
        messageActions.indexOf(MESSAGE_ACTIONS.delete) > -1 &&
        Message.canDeleteMessage()
      )
        options.splice(1, 0, {
          id: MESSAGE_ACTIONS.delete,
          title: 'Delete Message',
        });

      if (message.deleted_at)
        return (
          <DeletedContainer alignment={pos}>
            <DeletedText>This message was deleted ...</DeletedText>
          </DeletedContainer>
        );

      const contentProps = {
        alignment: pos,
        status: message.status,
        onLongPress: options.length > 1 ? this.showActionSheet : null,
        activeOpacity: 0.7,
        disabled: readOnly,
      };

      if (message.status === 'failed')
        contentProps.onPress = retrySendMessage.bind(this, Immutable(message));

      const context = {
        onLongPress: options.length > 1 ? this.showActionSheet : null,
      };

      return (
        <MessageContentContext.Provider value={context}>
          <Container {...contentProps}>
            {message.status === 'failed' ? (
              <FailedText>Message failed - try again</FailedText>
            ) : null}
            {message.latest_reactions &&
              message.latest_reactions.length > 0 && (
                <ReactionList
                  visible={!this.state.reactionPickerVisible}
                  latestReactions={message.latest_reactions}
                  openReactionSelector={this.openReactionSelector}
                  reactionCounts={message.reaction_counts}
                />
              )}
            {/* Reason for collapsible: https://github.com/facebook/react-native/issues/12966 */}
            <ContainerInner
              ref={(o) => (this.messageContainer = o)}
              collapsable={false}
            >
              {hasAttachment &&
                images.length <= 1 &&
                message.attachments.map((attachment, index) => (
                  <Attachment
                    key={`${message.id}-${index}`}
                    attachment={attachment}
                    actionHandler={this.props.handleAction}
                    alignment={this.props.alignment}
                  />
                ))}
              {images.length > 1 && (
                <Gallery alignment={this.props.alignment} images={images} />
              )}
              <MessageText
                message={message}
                groupStyles={groupStyles}
                isMyMessage={isMyMessage}
                disabled={message.status === 'failed'}
                onMessageTouch={this.onMessageTouch}
                Message={Message}
                openThread={this.openThread}
                handleReaction={handleReaction}
              />
            </ContainerInner>
            <MessageReplies
              message={message}
              isThreadList={!!threadList}
              openThread={this.openThread}
              pos={pos}
            />

            {showTime ? (
              <MetaContainer>
                <MetaText alignment={pos}>
                  {moment(message.created_at).format('h:mmA')}
                </MetaText>
              </MetaContainer>
            ) : null}

            <ActionSheet
              ref={(o) => {
                this.ActionSheet = o;
              }}
              title={<Text>Choose an action</Text>}
              options={options.map((o) => o.title)}
              cancelButtonIndex={0}
              destructiveButtonIndex={0}
              onPress={(index) => this.onActionPress(options[index].id)}
            />
            <ReactionPicker
              reactionPickerVisible={this.state.reactionPickerVisible}
              handleReaction={handleReaction}
              latestReactions={message.latest_reactions}
              reactionCounts={message.reaction_counts}
              handleDismiss={() => {
                this.setState({ reactionPickerVisible: false });
              }}
              rpLeft={this.state.rpLeft}
              rpRight={this.state.rpRight}
              rpTop={this.state.rpTop}
            />
          </Container>
        </MessageContentContext.Provider>
      );
    }
  },
);
