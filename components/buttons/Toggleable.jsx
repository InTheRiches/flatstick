import {StyleSheet, Pressable, Text} from 'react-native';
import useColors from "@/hooks/useColors";
import React from 'react';

export function Toggleable({onToggle, toggled, title = 'Save', ...rest}) {
    const colors = useColors();

    const styles = StyleSheet.create({
        button: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            paddingHorizontal: 32,
            borderRadius: 32,
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: toggled ? colors.toggleable.toggled.border : colors.toggleable.border,
            overflow: "hidden",
            alignSelf: "center",
            backgroundColor: toggled ? colors.toggleable.toggled.background : colors.toggleable.background
        }
    });

    return (
        <Pressable
            style={styles.button}
            onPress={onToggle} {...rest}>
            <Text style={{
                color: toggled ? colors.toggleable.toggled.color : colors.toggleable.color,
                fontWeight: 500
            }}>{title}</Text>
        </Pressable>
    );
}