import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {useTheme} from 'stream-chat-react-native';

import {IconProps} from '../utils/base';

export const Settings: React.FC<IconProps> = ({height = 24, width = 24}) => {
  const {
    theme: {
      colors: {black},
    },
  } = useTheme();

  return (
    <Svg fill="none" height={height} viewBox="0 0 24 24" width={width}>
      <Path
        d="M3.34 17a10.017 10.017 0 01-.978-2.326 3 3 0 00.002-5.347A9.99 9.99 0 014.865 4.99a3 3 0 004.631-2.674 9.99 9.99 0 015.007.002 3 3 0 004.632 2.672A9.99 9.99 0 0120.66 7c.433.749.757 1.53.978 2.326a3 3 0 00-.002 5.347 9.991 9.991 0 01-2.5 4.337 3 3 0 00-4.632 2.674 9.99 9.99 0 01-5.007-.002 3 3 0 00-4.632-2.672A10.02 10.02 0 013.34 17zm5.66.196a4.993 4.993 0 012.25 2.77c.5.047 1 .048 1.5 0a4.993 4.993 0 012.25-2.77 4.993 4.993 0 013.525-.564c.29-.408.54-.843.748-1.298A4.993 4.993 0 0118 12c0-1.26.47-2.437 1.273-3.334-.21-.455-.46-.89-.75-1.298A4.993 4.993 0 0115 6.804a4.992 4.992 0 01-2.25-2.77c-.499-.047-1-.048-1.499-.001a4.993 4.993 0 01-2.25 2.77 4.993 4.993 0 01-3.526.565 7.99 7.99 0 00-.748 1.298A4.993 4.993 0 016 12a4.99 4.99 0 01-1.273 3.334c.21.455.46.89.75 1.298A4.993 4.993 0 019 17.196zM12 15a3 3 0 110-6 3 3 0 010 6zm0-2a1 1 0 100-2 1 1 0 000 2z"
        fill={black}
      />
    </Svg>
  );
};
