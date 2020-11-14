import React from 'react';

import { IconProps, RootPath, RootSvg } from './utils/base';

export const ThumbsDownReaction: React.FC<IconProps> = (props) => (
  <RootSvg {...props}>
    <RootPath
      d='M5 7.681c0 1.242.087 3.032.394 3.53.306.497 2.976 2.961 3.84 4.968.863 2.007 1.012 4.821 2.43 4.821 1.419 0 1.883-1.073 1.733-3.277-.15-2.204-1.204-3.565-.463-4.101.503-.365 1.391.231 3.546.231.938 0 2.52 0 2.52-1.258s-.277-1.114-.404-1.968c-.126-.854.255-1.268-.166-2.231-.42-.964-.938-1.082-1.18-1.772-.24-.69-.155-1.432-1.282-2.443C14.842 3.17 13.045 3 11.665 3s-5.482.462-6.046 1.768C5.054 6.074 5 6.55 5 7.681z'
      {...props}
    />
  </RootSvg>
);