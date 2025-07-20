import React, {useEffect, useRef, useState} from "react";
import {BackHandler, Platform, ScrollView, View} from "react-native";
import {useLocalSearchParams, useNavigation} from "expo-router";
import {AdEventType, InterstitialAd, TestIds} from "react-native-google-mobile-ads";
import {getBestSession} from "../../../utils/sessions/best";
import Loading from "../../../components/general/popups/Loading";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import StrokesGainedSection from "../../../components/sessions/individual/new/StrokesGainedSection";
import PerformanceSection from "../../../components/sessions/individual/new/PerformanceSection";
import DistributionSection from "../../../components/sessions/individual/new/DistributionSection";
import BiasSection from "../../../components/sessions/individual/new/BiasSection";
import ActionButtons from "../../../components/sessions/individual/new/ActionButtons";
import Modals from "../../../components/sessions/individual/new/Modals";
import IndividualHeader from "../../../components/sessions/individual/new/IndividualHeader";
import {getUserDataByID} from "../../../utils/users/userServices";
import {useAppContext} from "../../../contexts/AppCtx";

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.OS === "ios"
    ? "ca-app-pub-2701716227191721/6686596809"
    : "ca-app-pub-2701716227191721/8364755969";
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

export default function IndividualSession() {
    const navigation = useNavigation();
    const { jsonSession, recap, userId } = useLocalSearchParams();
    const session = JSON.parse(jsonSession);
    const {userData: appUserData} = useAppContext();

    const [userData, setUserData] = useState(userId === undefined ? appUserData : null);

    useEffect(() => {
        if (userId === undefined) return;
        Promise.all([
            getUserDataByID(userId).then(setUserData).catch(error => {
                console.error("Error fetching user data:", error);
                setUserData(null);
            })
        ]).then(() => {
            setLoading(false); // Set loading to false when both are loaded
        });
    }, []);

    const isRecap = recap === "true";

    const [bestSession, setBestSession] = useState({ strokesGained: "~" });
    const [loading, setLoading] = useState(userId !== undefined);

    const shareSessionRef = useRef();
    const confirmDeleteRef = useRef();
    const infoModalRef = useRef();

    useEffect(() => {
        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            if (isRecap) interstitial.show();
        });

        if (isRecap) interstitial.load();

        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (!isRecap) navigation.goBack();
            return true;
        });

        return () => {
            unsubscribeLoaded();
            backHandler.remove();
        };
    }, []);

    useEffect(() => {
        // TODO make this not just get the user's best session, but the best session of whoever the session belongs to (or just remove this for sessions that arent the user's)
        getBestSession().then(setBestSession);
    }, []);

    const numOfHoles = session.filteredHoles || session.holes;

    return loading ? <Loading /> : (
        <>
            <ScreenWrapper style={{ paddingHorizontal: 20, justifyContent: "space-between" }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ marginBottom: 86 }}>
                        <IndividualHeader session={session} isRecap={isRecap} infoModalRef={infoModalRef} />
                        <View style={{flexDirection: "row"}}>
                            <StrokesGainedSection session={session} bestSession={bestSession} />
                            <PerformanceSection session={session} numOfHoles={numOfHoles} preferences={userData.preferences} />
                        </View>

                        <DistributionSection session={session} numOfHoles={numOfHoles} preferences={userData.preferences} />
                        <BiasSection session={session} />
                    </View>
                </ScrollView>
                <ActionButtons
                    session={session}
                    isSelf={userId === undefined}
                    isRecap={isRecap}
                    setLoading={setLoading}
                    navigation={navigation}
                    shareSessionRef={shareSessionRef}
                    confirmDeleteRef={confirmDeleteRef}
                />
            </ScreenWrapper>
            <Modals
                session={session}
                shareSessionRef={shareSessionRef}
                confirmDeleteRef={confirmDeleteRef}
                infoModalRef={infoModalRef}
                isRecap={isRecap}
                navigation={navigation}
            />
        </>
    );
}
