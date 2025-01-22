import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {BackHandler, Pressable, View} from "react-native";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import React, {useEffect, useRef, useState} from "react";
import useColors from "../../hooks/useColors";
import {runOnJS} from "react-native-reanimated";
import {useAppContext} from "../../contexts/AppCtx";
import {useNavigation} from "expo-router";
import {GripSelector, NewGripModal} from "../../components/editgrips";
import ScreenWrapper from "../../components/general/ScreenWrapper";
import FontText from "../../components/general/FontText";

export default function EditGrips() {
    const colors = useColors();
    const newGripRef = useRef(null);
    const {grips, userData, updateData, setUserData, deleteGrip, nonPersistentData, setNonPersistentData} = useAppContext();
    const navigation = useNavigation();
    const [selectedGrip, setGrip] = useState(userData.preferences.selectedGrip);
    const [editing, setEditing] = useState(false);

    const setSelectedGrip = (id) => {
        setGrip(id);
        setUserData({...userData, preferences: {...userData.preferences, selectedGrip: id}});
    }

    const onBackPress = () => {
        updateData({...userData});
        navigation.goBack();
        return true;
    };

    // on back button save
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        return () => backHandler.remove();
    }, []);

    const gesture = Gesture.Tap().onStart((data) => {
        runOnJS(updateData)({...userData});
        runOnJS(navigation.goBack)();
    });

    // TODO add a confirm delete modal
    const onDelete = (id) => {
        setEditing(false);

        deleteGrip(grips[id].type);

        if (selectedGrip === id) {
            setSelectedGrip(0);
        } else if (selectedGrip > id) {
            setSelectedGrip(selectedGrip - 1);
        }

        if (nonPersistentData.filtering.grip === id) {
            setNonPersistentData({...nonPersistentData, filtering: {...nonPersistentData.filtering, grip: 0}});
        } else if (nonPersistentData.filtering.grip > id) {
            setNonPersistentData({...nonPersistentData, filtering: {...nonPersistentData.filtering, grip: nonPersistentData.filtering.grip - 1}});
        }
    }

    return (
        <>
            <ScreenWrapper>
                <Pressable onPress={(event) => setEditing(false)} style={{paddingHorizontal: 24}}>
                    <GestureDetector gesture={gesture}>
                        <View style={{marginLeft: -10, paddingHorizontal: 10}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3}
                                 stroke={colors.text.primary} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                            </Svg>
                        </View>
                    </GestureDetector>
                    <View style={{flexDirection: "row", marginTop: 12, justifyContent: "space-between", alignItems: "center", width: "100%", borderBottomWidth: 1, borderColor: colors.border.default, paddingBottom: 10}}>
                        <FontText style={{fontSize: 24, fontWeight: 600, color: colors.text.primary}}>Your Grip Methods</FontText>
                        {
                            grips.length < 4 ? (
                                <PrimaryButton style={{ borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginLeft: 8}} onPress={() => {
                                    setEditing(false);
                                    newGripRef.current.present()
                                }} title={"New"}></PrimaryButton>
                            ) : (
                                <View style={{borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, marginLeft: 8, borderColor: colors.button.disabled.border, borderWidth: 1, backgroundColor: colors.button.disabled.background}}>
                                    <FontText style={{color: colors.text.secondary}}>At Max Grip Methods</FontText>
                                </View>
                            )
                        }
                    </View>
                    <View style={{marginTop: 16, width: "100%", paddingBottom: 12}}>
                        { (grips !== undefined && grips.length !== 0) &&
                            grips.map((grip, index) => {
                                return <GripSelector key={"grip_" + grip.type} id={index} name={grip.name} stats={grip.stats} selectedGrip={selectedGrip} onDelete={onDelete} editing={editing} setEditing={setEditing} setSelectedGrip={setSelectedGrip}></GripSelector>
                            })
                        }
                    </View>
                </Pressable>
            </ScreenWrapper>
            <NewGripModal newGripRef={newGripRef}></NewGripModal>
        </>
    )
}