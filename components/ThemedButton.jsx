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
          backgroundColor: disabled ? colors.buttonDisabledBackground : colors.buttonPrimaryBackground,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: disabled ? colors.buttonDisabledBorder : colors.buttonPrimaryBorder,
          overflow: "hidden",
          alignSelf: "center"
        }
      });

    return (
        <Pressable style={styles.button} onPress={onPress} {...rest}>
            <Text style={{ color: disabled ? colors.buttonDisabledText : colors.buttonPrimaryText, fontWeight: 500 }}>{title}</Text>
        </Pressable>
    );
}

