import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView} from "react-native";
import {LeftRightBias, ShortPastBias} from "../../../sessions/individual";
import {useAppContext} from "../../../../contexts/AppCtx";
import ScreenWrapper from "../../../general/ScreenWrapper";

// TODO - implement this component
export default function PlacementTab({statsToUse}) {
    const colors = useColors();
    const {width} = Dimensions.get("screen");
    const {userData} = useAppContext();

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
                <LeftRightBias bias={statsToUse.leftRightBias} units={userData.preferences.units}/>
                <ShortPastBias bias={statsToUse.shortPastBias} units={userData.preferences.units}/>
            </ScrollView>
        </ScreenWrapper>
    )
}