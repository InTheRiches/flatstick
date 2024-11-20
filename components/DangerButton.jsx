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
          backgroundColor: disabled ? colors.buttonDangerDisabledBackground : colors.buttonDangerBackground,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: disabled ? colors.buttonDangerDisabledBorder : colors.buttonDangerBorder,
          alignSelf: "center",
        }
      });

    return (
        <Pressable style={styles.button} onPress={onPress} {...rest}>
            <Text style={{ color: disabled ? colors.buttonDangerDisabledText : colors.buttonDangerText, fontWeight: 500 }}>{title}</Text>
        </Pressable>
    );
}