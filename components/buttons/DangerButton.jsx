import {StyleSheet, Pressable, Text} from 'react-native';
import useColors from "@/hooks/useColors";
import React from 'react';

export default function DangerButton({onPress, title = 'Save', disabled = false, children, style = {}, ...rest}) {
  const colors = useColors();

  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 32,
      borderRadius: 8,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: disabled ? colors.button.danger.disabled.border : colors.button.danger.border,
      overflow: "hidden",
      alignSelf: "center"
    },
    bareButton: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: disabled ? colors.button.danger.disabled.border : colors.button.danger.border,
    }
  });

  return (
    <Pressable
      style={({pressed}) => [{backgroundColor: disabled ? colors.button.danger.disabled.background : pressed ? colors.button.danger.depressed : colors.button.danger.background}, Object.keys(style).length !== 0 ? [styles.bareButton, style] : styles.button]}
      onPress={onPress} {...rest}>
      {React.Children.count(children) > 0 ? children : <Text style={{
        color: disabled ? colors.button.danger.disabled.text : colors.button.danger.text,
        fontWeight: 500
      }}>{title}</Text>}
    </Pressable>
  );
}