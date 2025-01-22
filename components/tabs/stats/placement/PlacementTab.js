import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView} from "react-native";
import {LeftRightBias, ShortPastBias} from "../../../sessions/individual";
import {useAppContext} from "../../../../contexts/AppCtx";

export default function PlacementTab({statsToUse}) {
    const colors = useColors();
    const {width} = Dimensions.get("screen");
    const {userData} = useAppContext();

    return (
        <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
            <LeftRightBias bias={statsToUse.leftRightBias} units={userData.preferences.units}/>
            <ShortPastBias bias={statsToUse.shortPastBias} units={userData.preferences.units}/>
        </ScrollView>
    )
}