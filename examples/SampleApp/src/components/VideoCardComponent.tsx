import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { Attachment } from 'stream-chat';
import { FileAttachment, useMessageContext } from 'stream-chat-react-native';
import type { LocalAttachmentType } from '../types';
import { createThumbnail } from 'react-native-create-thumbnail';
import { Play } from '../icons/Play';

type VideoCardProps = {
  attachment: Attachment<LocalAttachmentType>;
  onPress: () => void;
};

const styles = StyleSheet.create({
  backgroundVideo: {
    height: 200,
    width: 250,
  },
  image: {
    borderBottomLeftRadius: 14,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  playButton: {
    marginBottom: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    position: 'relative',
  },
});

const VideoCard: React.FC<VideoCardProps> = ({ attachment, onPress }) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const { onLongPress } = useMessageContext();

  useEffect(() => {
    createThumbnail({
      cacheName: attachment.title,
      format: 'png',
      url: attachment.asset_url as string,
    })
      .then((response) => {
        setThumbnail(response.path);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [attachment]);

  const isVideo = attachment.type === 'video';

  if (isVideo) {
    return (
      <TouchableOpacity
        onLongPress={(event) => {
          if (onLongPress) {
            onLongPress({
              emitter: 'gallery',
              event,
            });
          }
        }}
        onPress={onPress}
      >
        <ImageBackground
          imageStyle={styles.image}
          source={{ uri: thumbnail }}
          style={styles.backgroundVideo}
        >
          <Play fill={'#fff'} height={50} style={styles.playButton} width={50} />
        </ImageBackground>
      </TouchableOpacity>
    );
  } else {
    return <FileAttachment attachment={attachment} />;
  }
};

export default VideoCard;
