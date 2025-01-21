import {Pressable, StyleSheet, View} from 'react-native';
import useColors from "@/hooks/useColors";
import React from 'react';
import FontText from "../FontText";

export function Toggleable({onToggle, toggled, title = 'Save', ...rest}) {
    const colors = useColors();

    const styles = StyleSheet.create({
        button: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
            borderRadius: 32,
            borderWidth: 1,
            overflow: "visible",
            borderColor: toggled ? colors.toggleable.toggled.border : colors.toggleable.border,
            backgroundColor: toggled ? colors.toggleable.toggled.background : colors.toggleable.background
        }
    });

    return (
        <Pressable
            style={styles.button}
            onPress={onToggle} {...rest}>
           <View style={{paddingVertical: 8, overflow: "visible"}}>
               <FontText style={{
                   color: toggled ? colors.toggleable.toggled.color : colors.toggleable.color,
                   fontWeight: 500,
               }}>{title}</FontText>
           </View>
        </Pressable>
    );
}