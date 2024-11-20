import { StyleSheet, Pressable, Text } from 'react-native';
import useColors from "../hooks/useColors";

export function DangerButton({ onPress, title = 'Save', disabled = false, ...rest }) {
    const colors = useColors();

    const styles = StyleSheet.create({
        button: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
          paddingHorizontal: 24,
          borderRadius: 6,
          backgroundColor: disabled ? colors.button.danger.disabled.background : colors.button.danger.background,
          borderWidth: 1,
          borderColor: disabled ? colors.button.danger.disabled.border : colors.button.danger.border,
          alignSelf: "center",
        }
      });

    return (
        <Pressable style={styles.button} onPress={onPress} {...rest}>
            <Text style={{ color: disabled ? colors.buttonDangerDisabledText : colors.button.danger.text, fontWeight: 500 }}>{title}</Text>
        </Pressable>
    );
}