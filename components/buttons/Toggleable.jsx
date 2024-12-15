import {Pressable, StyleSheet, Text, View} from 'react-native';
import useColors from "@/hooks/useColors";
import React from 'react';

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
           <View style={{paddingTop: 10, paddingBottom: 12, overflow: "visible"}}>
               <Text style={{
                   color: toggled ? colors.toggleable.toggled.color : colors.toggleable.color,
                   fontWeight: 500,
               }}>{title}</Text>
           </View>
        </Pressable>
    );
}