declare module '*.svg' {
  import * as React from 'react';
    import { SvgProps } from 'react-native-svg';
  const content: React.FunctionComponent<SvgProps>;
  export default content;
}
