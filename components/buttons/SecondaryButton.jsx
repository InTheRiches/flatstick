import {StyleSheet, Pressable, Text} from 'react-native';
import useColors from "@/hooks/useColors";
import React from 'react';

export function SecondaryButton({onPress, title = 'Save', disabled = false, children, style = {}, ...rest}) {
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
      borderColor: disabled ? colors.button.disabled.border : colors.button.secondary.border,
      overflow: "hidden",
      alignSelf: "center"
    },
    bareButton: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: disabled ? colors.button.disabled.border : colors.button.secondary.border,
    }
  });

  return (
    <Pressable
      style={({pressed}) => [{backgroundColor: disabled ? colors.button.disabled.background : pressed ? colors.button.secondary.depressed : colors.button.secondary.background}, Object.keys(style).length !== 0 ? [styles.bareButton, style] : styles.button]}
      onPress={onPress} {...rest}>
      {React.Children.count(children) > 0 ? children : <Text style={{
        color: disabled ? colors.button.disabled.text : colors.button.secondary.text,
        fontWeight: 500
      }}>{title}</Text>}
    </Pressable>
  );
}