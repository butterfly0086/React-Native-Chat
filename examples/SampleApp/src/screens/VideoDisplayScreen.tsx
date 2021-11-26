import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';
import type { StackNavigatorParamList } from '../types';

type VideoDisplayScreenNavigationProps = StackNavigationProp<
  StackNavigatorParamList,
  'VideoDisplayScreen'
>;
export type VideoDisplayScreenRouteProp = RouteProp<StackNavigatorParamList, 'VideoDisplayScreen'>;
export type VideoDisplayScreenProps = {
  navigation: VideoDisplayScreenNavigationProps;
  route: VideoDisplayScreenRouteProp;
};

const styles = StyleSheet.create({
  backgroundVideo: {
    height: '100%',
    width: '100%',
  },
});

export const VideoDisplayScreen: React.FC<VideoDisplayScreenProps> = ({
  route: {
    params: { attachment },
  },
}) => (
  <Video
    controls={true}
    key={attachment.asset_url}
    paused={false}
    resizeMode='none'
    source={{ uri: attachment.asset_url }}
    style={styles.backgroundVideo}
  />
);
