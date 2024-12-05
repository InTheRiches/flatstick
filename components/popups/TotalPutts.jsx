import React, {useState} from 'react';
import {View, Text, Pressable, TextInput} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";

export default function TotalPutts({totalPuttsRef, nextHole}) {
    const colors = useColors();

    const [putts, setPutts] = useState(2);
    const [puttsFocused, setPuttsFocused] = useState(false);

    // renders
    return (
        <BottomSheetModal ref={totalPuttsRef}
                          backgroundStyle={{backgroundColor: colors.background.secondary}}>
            <BottomSheetView style={{paddingBottom: 12, backgroundColor: colors.background.secondary}}>
                <View style={{marginHorizontal: 24}}>
                    <Text style={{fontSize: 20, fontWeight: 500, color: colors.text.primary}}>Next Hole</Text>
                    <Text style={{
                        marginTop: 12,
                        fontSize: 18,
                        color: colors.text.primary,
                        marginBottom: 10
                    }}>Total putts for the hole</Text>
                    <View style={{flexDirection: "row", gap: 12, marginBottom: 12}}>
                    <TextInput
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: puttsFocused ? colors.input.focused.border : colors.input.border,
                            borderRadius: 10,
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            fontSize: 16,
                            color: colors.input.text,
                            backgroundColor: puttsFocused ? colors.input.focused.background : colors.input.background
                        }}
                        onFocus={() => setPuttsFocused(true)}
                        onBlur={() => setPuttsFocused(false)}
                        value={putts}
                        onChangeText={(text) => setPutts(text)}
                    />
                    </View>
                    <PrimaryButton title={"Next Hole"} onPress={() => {
                        nextHole(parseInt(putts));
                        totalPuttsRef.current?.dismiss();
                    }}></PrimaryButton>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};