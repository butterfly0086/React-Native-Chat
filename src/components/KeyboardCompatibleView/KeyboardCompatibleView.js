import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, View } from 'react-native';

import { useKeyboardCompatibleHeight } from './hooks/useKeyboardCompatibleHeight';

import { KeyboardContext } from '../../context';

/**
 * KeyboardCompatibleView is HOC component similar to [KeyboardAvoidingView](https://facebook.github.io/react-native/docs/keyboardavoidingview),
 * designed to work with MessageInput and MessageList component.
 *
 * Main motivation of writing this our own component was to get rid of issues that come with KeyboardAvoidingView from react-native
 * when used with components of fixed height. [Channel](https://github.com/GetStream/stream-chat-react-native/blob/master/src/components/ChannelInner.js) component
 * uses `KeyboardCompatibleView` internally, so you don't need to explicitly add it.
 *
 * ```json
 * <KeyboardCompatibleView>
 *  <MessageList />
 *  <MessageInput />
 * </KeyboardCompatibleView>
 * ```
 */
export const KeyboardCompatibleView = ({
  enabled = true,
  keyboardDismissAnimationDuration = 500,
  keyboardOpenAnimationDuration = 500,
  children,
}) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rootChannelView = useRef();

  const [initialHeight, setInitialHeight] = useState(0);

  const [channelHeight, isKeyboardOpen] = useKeyboardCompatibleHeight({
    enabled,
    initialHeight,
    rootChannelView,
  });

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: channelHeight,
      duration: isKeyboardOpen
        ? keyboardDismissAnimationDuration
        : keyboardOpenAnimationDuration,
      useNativeDriver: false,
    }).start();
  }, [
    heightAnim,
    channelHeight,
    keyboardDismissAnimationDuration,
    keyboardOpenAnimationDuration,
  ]);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();

    return new Promise((resolve) => {
      if (!isKeyboardOpen) {
        // If channel height is already at full length, then don't do anything.
        resolve();
      } else {
        // Bring the channel height to its full length state.
        Animated.timing(heightAnim, {
          toValue: initialHeight,
          duration: keyboardDismissAnimationDuration,
          useNativeDriver: false,
        }).start(resolve);
      }
    });
  }, [
    heightAnim,
    initialHeight,
    channelHeight,
    isKeyboardOpen,
    keyboardDismissAnimationDuration,
  ]);

  const onLayout = useCallback(
    ({
      nativeEvent: {
        layout: { height },
      },
    }) => {
      if (!enabled) {
        return;
      }

      // Not to set initial height again.
      if (!initialHeight) {
        setInitialHeight(height);
        Animated.timing(heightAnim, {
          toValue: height,
          duration: 10,
          useNativeDriver: false,
        }).start();
      }
    },
    [heightAnim, initialHeight, enabled],
  );

  if (!enabled) {
    return (
      <KeyboardContext.Provider
        value={{
          dismissKeyboard,
        }}
      >
        {children}
      </KeyboardContext.Provider>
    );
  }

  return (
    <Animated.View
      onLayout={onLayout}
      style={{
        height: initialHeight ? heightAnim : undefined,
      }}
    >
      <KeyboardContext.Provider value={{ dismissKeyboard }}>
        <View collapsable={false} ref={rootChannelView}>
          {children}
        </View>
      </KeyboardContext.Provider>
    </Animated.View>
  );
};

export default KeyboardCompatibleView;
