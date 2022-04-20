import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { ImageGalleryVideoControl } from './ImageGalleryVideoControl';

import { useTheme } from '../../../contexts/themeContext/ThemeContext';
import { useTranslationContext } from '../../../contexts/translationContext/TranslationContext';
import { Grid as GridIconDefault, Share as ShareIconDefault } from '../../../icons';
import { deleteFile, saveFile, shareImage } from '../../../native';

import type { DefaultStreamChatGenerics } from '../../../types/types';
import type { Photo } from '../ImageGallery';

const ReanimatedSafeAreaView = Animated.createAnimatedComponent
  ? Animated.createAnimatedComponent(SafeAreaView)
  : SafeAreaView;

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  durationTextStyle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageCountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  innerContainer: {
    flexDirection: 'row',
    height: 56,
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 8,
  },
  rightContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  roundedView: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    display: 'flex',
    elevation: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  videoContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(52, 52, 52, 0.1)',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  wrapper: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});

export type ImageGalleryFooterCustomComponent<
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
> = ({
  openGridView,
  photo,
  share,
  shareMenuOpen,
}: {
  openGridView: () => void;
  share: () => Promise<void>;
  shareMenuOpen: boolean;
  photo?: Photo<StreamChatGenerics>;
}) => React.ReactElement | null;

export type ImageGalleryFooterCustomComponentProps<
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
> = {
  centerElement?: ImageGalleryFooterCustomComponent<StreamChatGenerics>;
  GridIcon?: React.ReactElement;
  leftElement?: ImageGalleryFooterCustomComponent<StreamChatGenerics>;
  rightElement?: ImageGalleryFooterCustomComponent<StreamChatGenerics>;
  ShareIcon?: React.ReactElement;
};

type ImageGalleryFooterPropsWithContext<
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
> = ImageGalleryFooterCustomComponentProps<StreamChatGenerics> & {
  duration: number;
  onPlayPause: () => void;
  onProgressDrag: (progress: number) => void;
  opacity: Animated.SharedValue<number>;
  openGridView: () => void;
  paused: boolean;
  photo: Photo<StreamChatGenerics>;
  photoLength: number;
  progress: number;
  selectedIndex: number;
  visible: Animated.SharedValue<number>;
};

export const ImageGalleryFooterWithContext = <
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
>(
  props: ImageGalleryFooterPropsWithContext<StreamChatGenerics>,
) => {
  const {
    centerElement,
    duration,
    GridIcon,
    leftElement,
    onPlayPause,
    onProgressDrag,
    opacity,
    openGridView,
    paused,
    photo,
    photoLength,
    progress,
    rightElement,
    selectedIndex,
    ShareIcon,
    visible,
  } = props;

  const [height, setHeight] = useState(200);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const {
    theme: {
      colors: { black },
      imageGallery: {
        footer: {
          centerContainer,
          container,
          imageCountText,
          innerContainer,
          leftContainer,
          rightContainer,
        },
      },
    },
  } = useTheme();
  const { t } = useTranslationContext();

  const footerStyle = useAnimatedStyle<ViewStyle>(
    () => ({
      opacity: opacity.value,
      transform: [
        {
          translateY: interpolate(visible.value, [0, 1], [height, 0], Extrapolate.CLAMP),
        },
      ],
    }),
    [],
  );

  const share = async () => {
    setShareMenuOpen(true);
    try {
      const localImage = await saveFile({
        fileName: `${photo.user?.id || 'ChatPhoto'}-${photo.messageId}-${selectedIndex}.jpg`,
        fromUrl: photo.uri,
      });
      await shareImage({ type: 'image/jpeg', url: localImage });
      await deleteFile({ uri: localImage });
    } catch (error) {
      console.log(error);
    }
    setShareMenuOpen(false);
  };

  return (
    <Animated.View
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      pointerEvents={'box-none'}
      style={styles.wrapper}
    >
      <ReanimatedSafeAreaView style={[container, footerStyle]}>
        {photo.type === 'video' && (
          <ImageGalleryVideoControl
            duration={duration}
            onPlayPause={onPlayPause}
            onProgressDrag={onProgressDrag}
            paused={paused}
            progress={progress}
          />
        )}
        <View style={[styles.innerContainer, innerContainer, { backgroundColor: 'white' }]}>
          {leftElement ? (
            leftElement({ openGridView, photo, share, shareMenuOpen })
          ) : (
            <TouchableOpacity disabled={shareMenuOpen} onPress={share}>
              <View style={[styles.leftContainer, leftContainer]}>
                {ShareIcon ? ShareIcon : <ShareIconDefault />}
              </View>
            </TouchableOpacity>
          )}
          {centerElement ? (
            centerElement({ openGridView, photo, share, shareMenuOpen })
          ) : (
            <View style={[styles.centerContainer, centerContainer]}>
              <Text style={[styles.imageCountText, { color: black }, imageCountText]}>
                {t('{{ index }} of {{ photoLength }}', {
                  index: photoLength - selectedIndex,
                  photoLength,
                })}
              </Text>
            </View>
          )}
          {rightElement ? (
            rightElement({ openGridView, photo, share, shareMenuOpen })
          ) : (
            <TouchableOpacity onPress={openGridView}>
              <View style={[styles.rightContainer, rightContainer]}>
                {GridIcon ? GridIcon : <GridIconDefault />}
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ReanimatedSafeAreaView>
    </Animated.View>
  );
};

const areEqual = <StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics>(
  prevProps: ImageGalleryFooterPropsWithContext<StreamChatGenerics>,
  nextProps: ImageGalleryFooterPropsWithContext<StreamChatGenerics>,
) => {
  const {
    duration: prevDuration,
    paused: prevPaused,
    progress: prevProgress,
    selectedIndex: prevSelectedIndex,
  } = prevProps;
  const {
    duration: nextDuration,
    paused: nextPaused,
    progress: nextProgress,
    selectedIndex: nextSelectedIndex,
  } = nextProps;

  const isDurationEqual = prevDuration === nextDuration;
  if (!isDurationEqual) return false;

  const isPausedEqual = prevPaused === nextPaused;
  if (!isPausedEqual) return false;

  const isProgressEqual = prevProgress === nextProgress;
  if (!isProgressEqual) return false;

  const isSelectedIndexEqual = prevSelectedIndex === nextSelectedIndex;
  if (!isSelectedIndexEqual) return false;

  return true;
};

const MemoizedImageGalleryFooter = React.memo(
  ImageGalleryFooterWithContext,
  areEqual,
) as typeof ImageGalleryFooterWithContext;

export type ImageGalleryFooterProps<
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
> = ImageGalleryFooterPropsWithContext<StreamChatGenerics>;

export const ImageGalleryFooter = <
  StreamChatGenerics extends DefaultStreamChatGenerics = DefaultStreamChatGenerics,
>(
  props: ImageGalleryFooterProps<StreamChatGenerics>,
) => <MemoizedImageGalleryFooter {...props} />;

ImageGalleryFooter.displayName = 'ImageGalleryFooter{imageGallery{footer}}';
