import {Pressable} from "react-native";
import React from "react";
import {MaterialCommunityIcons} from "@expo/vector-icons";

const CheckBox = (props) => {
    const iconName = props.isChecked ?
        "checkbox-marked" : "checkbox-blank-outline";

    return (
        <Pressable onPress={props.onPress}>
            <MaterialCommunityIcons
                name={iconName} size={24} color="#000" />
        </Pressable>
    );
};

export default CheckBox;