import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import useColors from "@/hooks/useColors";

export function HorizRadioButton({ options, selectedOption, setSelectedOption }) {
    const colors = useColors();

    const handleSelectOption = (option) => {
        if (selectedOption === option)
            setSelectedOption(undefined);
        else
            setSelectedOption(option);
    };

    const renderRadioButton = (option, index) => {
        let style = styles.radioButton;

        // Check if the current option is selected
        const isSelected = selectedOption === option;

        // Set the base border color
        style = { ...style, borderColor: isSelected ? colors.radioButtonSelectedBorder : colors.radioButtonBorder, backgroundColor: isSelected ? colors.radioButtonSelectedBackground : colors.radioButtonBackground };

        // If the previous or next option is selected, disable overlapping borders
        if (index > 0 && selectedOption === options[index - 1])
            style = { ...style, borderLeftWidth: 0, borderRightWidth: 0 };
        if ((index < options.length - 1 && selectedOption === options[index + 1]) || ((index < options.length - 2 && selectedOption === options[index + 2])))
            style = { ...style, borderRightWidth: 0 };

        // Handle border radius for the first and last options
        if (index === 0)
            style = { ...style, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 };
        if (index === options.length - 1)
            style = { ...style, borderRightWidth: 1, borderTopRightRadius: 8, borderBottomRightRadius: 8 };

        if (index !== options.length - 1 && selectedOption === undefined) {
            style = { ...style, borderRightWidth: 0 };
        }

        return (
            <TouchableOpacity
                style={style}
                key={option}
                onPress={() => handleSelectOption(option)}
                activeOpacity={0.75}
            >
                <View style={[styles.radioCircle,
                    { backgroundColor: isSelected ? colors.radioButtonSelectedRadio : colors.radioButtonBorder }]}>
                    <View style={{...styles.radioInnerCircle, backgroundColor: colors.radioButtonBackground }} />
                </View>
                <ThemedText style={{ ...styles.option, color: isSelected ? colors.radioButtonSelectedText : colors.radioButtonText }}>{option}</ThemedText>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.radioGroup}>
            { options.map((option, index) => renderRadioButton(option, index)) }
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        marginHorizontal: 10,
        marginTop: 50
    },
    text:{
        fontSize:15,
    },
    radioGroup: {
        flexDirection: 'row',
        width: "100%"
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        paddingLeft: 12,
        paddingVertical: 8,
        borderWidth: 1,
        flexGrow: 1
    },
    radioCircle: {
        height: 15,
        width: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 2,
    },
    radioInnerCircle: {
        height: 6,
        width: 6,
        borderRadius: 6,
    },
    option: {
        fontSize: 14,
        paddingLeft: 5,
    },
});