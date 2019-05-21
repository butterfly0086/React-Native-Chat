import React from 'react';
import { View } from 'react-native';
import { buildStylesheet } from '../../styles/styles.js';
import { renderText, capitalize } from '../../utils';

export const MessageText = ({
  message,
  isMyMessage = () => false,
  style = null,
}) => {
  const pos = isMyMessage(message) ? 'right' : 'left';

  const hasAttachment = message.attachments.length > 0 ? true : false;
  const groupStyles =
    (isMyMessage(message) ? 'right' : 'left') +
    capitalize(hasAttachment ? 'bottom' : message.groupPosition[0]);

  if (!message.text) return false;

  const styles = buildStylesheet('MessageSimpleText', style);

  return (
    <React.Fragment>
      <View
        style={{
          ...styles.container,
          ...styles[pos],

          ...styles[groupStyles],
          ...styles[message.status],
        }}
      >
        {renderText(message)}
      </View>
    </React.Fragment>
  );
};
