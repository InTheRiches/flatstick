import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {BackHandler, Pressable, View} from "react-native";
import Svg, {Path} from "react-native-svg";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import React, {useEffect, useRef, useState} from "react";
import useColors from "../../hooks/useColors";
import {runOnJS} from "react-native-reanimated";
import {useAppContext} from "../../contexts/AppCtx";
import {useNavigation} from "expo-router";
import {NewPutterModal, PutterSelector} from "../../components/editputters";
import ScreenWrapper from "../../components/general/ScreenWrapper";
import FontText from "../../components/general/FontText";

export default function EditPutters() {
    const colors = useColors();
    const newPutterRef = useRef(null);
    const {putters, userData, nonPersistentData, setNonPersistentData, updateData, setUserData, deletePutter} = useAppContext();
    const navigation = useNavigation();
    const [selectedPutter, setPutter] = useState(userData.preferences.selectedPutter);
    const [editing, setEditing] = useState(false);

    const setSelectedPutter = (id) => {
        setPutter(id);
        setUserData({...userData, preferences: {...userData.preferences, selectedPutter: id}});
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
    }, [selectedPutter]);

    const gesture = Gesture.Tap().onStart((data) => {
        runOnJS(updateData)({...userData});
        runOnJS(navigation.goBack)();
    });

    // TODO add a confirm delete modal
    const onDelete = (id) => {
        setEditing(false);

        deletePutter(putters[id].type);

        if (selectedPutter === id) {
            setSelectedPutter(0);
        } else if (selectedPutter > id) {
            setSelectedPutter(selectedPutter - 1);
        }

        if (nonPersistentData.filtering.putter === id) {
            setNonPersistentData({...nonPersistentData, filtering: {...nonPersistentData.filtering, putter: 0}});
        } else if (nonPersistentData.filtering.putter > id) {
            setNonPersistentData({...nonPersistentData, filtering: {...nonPersistentData.filtering, putter: 0}});
        }
    }

    return (
        <>
            <ScreenWrapper>
                <Pressable onPress={(event) => setEditing(false)} style={{paddingHorizontal: 20, height: "100%"}}>
                    <GestureDetector gesture={gesture}>
                        <View style={{marginLeft: -10, paddingHorizontal: 10}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5}
                                 stroke={colors.text.primary} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                            </Svg>
                        </View>
                    </GestureDetector>
                    <View style={{flexDirection: "row", marginTop: 12, justifyContent: "space-between", alignItems: "center", width: "100%", borderBottomWidth: 1, borderColor: colors.border.default, paddingBottom: 10}}>
                        <FontText style={{fontSize: 24, fontWeight: 600, color: colors.text.primary}}>Your Putters</FontText>
                        {
                            putters.length < 4 ? (
                                <PrimaryButton style={{ borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginLeft: 8}} onPress={() => {
                                    setEditing(false);
                                    newPutterRef.current.present()
                                }} title={"New"}></PrimaryButton>
                            ) : (
                                <View style={{borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, marginLeft: 8, borderColor: colors.button.disabled.border, borderWidth: 1, backgroundColor: colors.button.disabled.background}}>
                                    <FontText style={{color: colors.text.secondary}}>At Max Putters</FontText>
                                </View>
                            )
                        }
                    </View>
                    <View style={{marginTop: 16, width: "100%", paddingBottom: 12}}>
                        { (putters !== undefined && putters.length !== 0) &&
                            putters.map((putter, index) => {
                                return <PutterSelector key={"putt_" + putter.type} id={index} name={putter.name} stats={putter.stats} selectedPutter={selectedPutter} onDelete={onDelete} editing={editing} setEditing={setEditing} setSelectedPutter={setSelectedPutter}></PutterSelector>
                            })
                        }
                    </View>
                </Pressable>
                <NewPutterModal newPutterRef={newPutterRef}></NewPutterModal>
            </ScreenWrapper>
        </>
    )
}