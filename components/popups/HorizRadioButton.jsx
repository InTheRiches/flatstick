import React, { useEffect } from 'react';
import { View, StyleSheet, Text, StatusBar, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function HorizRadioButton({ options, selectedOption, setSelectedOption }) {
    const colorScheme = useColorScheme();

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
        style = isSelected ? { ...style, borderColor: "#7F944F", backgroundColor: "#59663A" } : { ...style, borderColor: Colors[colorScheme ?? 'light'].border };

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

        if (index != options.length - 1 && selectedOption == undefined) {
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
                    { backgroundColor: selectedOption === option ? '#7F944F' : Colors[colorScheme ?? 'light'].background, borderColor: selectedOption === option ? '#7F944F' : Colors[colorScheme ?? 'light'].border }]}>
                    {selectedOption === option &&
                        <View style={styles.selectedRadioInnerCircle} />
                    }
                </View>
                <ThemedText style={ selectedOption === option ? { ...styles.option, color: "white" } : styles.option }>{option}</ThemedText>
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
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 2,
    },
    selectedRadioInnerCircle: {
        height: 6,
        width: 6,
        borderRadius: 6,
        backgroundColor: 'white',
    },
    option: {
        fontSize: 14,
        paddingLeft: 5,
    },
});