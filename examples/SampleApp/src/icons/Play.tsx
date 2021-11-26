import React from 'react';

import { IconProps, RootPath, RootSvg } from '../utils/base';

export const Play: React.FC<IconProps> = (props) => {
  const { fill, ...rest } = props;
  return (
    <RootSvg {...rest}>
      <RootPath
        d='M9.5547 5.03647C8.89014 4.59343 8 5.06982 8 5.86852V18.1315C8 18.9302 8.89015 19.4066 9.5547 18.9635L18.7519 12.8321C19.3457 12.4362 19.3457 11.5638 18.7519 11.1679L9.5547 5.03647Z'
        pathFill={fill}
        {...rest}
      />
    </RootSvg>
  );
};
