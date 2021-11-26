import { registerNativeHandlers } from 'stream-chat-react-native-core';
import CameraRoll from '@react-native-community/cameraroll';
import { PermissionsAndroid, Platform } from 'react-native';

registerNativeHandlers({
  getPhotos: async ({ after, first }) => {
    try {
      if (Platform.OS === 'android') {
        const readExternalStoragePermissionAndroid =
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const hasPermission = await PermissionsAndroid.check(readExternalStoragePermissionAndroid);
        if (!hasPermission) {
          const granted = await PermissionsAndroid.request(readExternalStoragePermissionAndroid, {
            buttonNegative: 'Deny',
            buttonNeutral: 'Ask Me Later',
            buttonPositive: 'Allow',
            message: 'Permissions are required to access and share photos.',
            title: 'Photos Access',
          });
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            throw new Error('getPhotos Error');
          }
        }
      }
      const results = await CameraRoll.getPhotos({
        after,
        assetType: 'All',
        first,
        include: ['imageSize'],
      });
      const assets = results.edges.map((edge) => ({
        ...edge.node.image,
        source: 'picker',
      }));
      const hasNextPage = results.page_info.has_next_page;
      const endCursor = results.page_info.end_cursor;
      return { assets, endCursor, hasNextPage };
    } catch (_error) {
      throw new Error('getPhotos Error');
    }
  },
});

export * from 'stream-chat-react-native-core';
