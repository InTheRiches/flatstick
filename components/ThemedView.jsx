import { View } from 'react-native';

import useColors from "@/hooks/useColors";

export function ThemedView({ style, type, ...otherProps }) {

  const backgroundColor = useColors()[type === "secondary" ? 'backgroundSecondary' : 'background'];

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
