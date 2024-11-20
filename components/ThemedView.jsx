import { View } from 'react-native';

import useColors from "@/hooks/useColors";

export function ThemedView({ style, type, ...otherProps }) {

  const backgroundColor = useColors()["background"][type === "secondary" ? "secondary" : "primary"];

  return <View style={[{ backgroundColor: backgroundColor }, style]} {...otherProps} />;
}
