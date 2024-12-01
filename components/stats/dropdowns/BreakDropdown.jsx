import {useState} from "react";
import {Text, View, StyleSheet} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import useColors from "../../../hooks/useColors";

const data = [
    {label: 'Left to Right', value: '1'},
    {label: 'Straight', value: '2'},
    {label: 'Right to Left', value: '3'},
];

const DropdownComponent = ({value, setValue}) => {
    const [isFocus, setIsFocus] = useState(false);

    const colors = useColors();

    const renderItem = item => {
        return (
            <View style={{padding: 12}}>
                <Text style={{color: colors.text.primary, fontSize: 16}}>{item.label}</Text>
            </View>
        );
    };

    return (
        <Dropdown
            style={[styles.dropdown, {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
            }]}
            placeholderStyle={{fontSize: 16, color: colors.text.secondary}}
            selectedTextStyle={{fontSize: 16, color: colors.text.primary}}
            containerStyle={{
                borderRadius: 8,
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
                borderWidth: 1.5,
            }}
            activeColor={colors.border.default}
            renderItem={renderItem}
            data={data}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={'Select break'}
            value={value}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
                setValue(item.value);
                setIsFocus(false);
            }}
        />
    );
};

export default DropdownComponent;

const styles = StyleSheet.create({
    dropdown: {
        height: 45,
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        flex: 1
    },
});