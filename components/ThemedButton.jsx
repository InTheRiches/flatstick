import { StyleSheet, Pressable, Text } from 'react-native';
import useColors from "@/hooks/useColors";

// TODO MAKE COMPONENTS FOR DISABLED BUTTONS, PRIMARY BUTTONS, SECONDARY BUTTONS, etc
export function ThemedButton({ onPress, title = 'Save', disabled = false, ...rest }) {
    const colors = useColors();

    const styles = StyleSheet.create({
        button: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
          paddingHorizontal: 24,
          borderRadius: 8,
          backgroundColor: disabled ? colors.button.disabled.background : colors.button.primary.background,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: disabled ? colors.button.disabled.border : colors.button.primary.border,
          overflow: "hidden",
          alignSelf: "center"
        }
      });

    return (
        <Pressable style={styles.button} onPress={onPress} {...rest}>
            <Text style={{ color: disabled ? colors.button.disabled.text : colors.button.primary.text, fontWeight: 500 }}>{title}</Text>
        </Pressable>
    );
}

