import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView, View} from "react-native";
import {LeftRightBias, ShortPastBias} from "../../../sessions/individual";
import {useAppContext} from "../../../../contexts/AppCtx";
import ScreenWrapper from "../../../general/ScreenWrapper";
import FontText from "../../../general/FontText";

// TODO - implement this component
export default function MissBiasTab({statsToUse}) {
    const {width} = Dimensions.get("screen");
    const {userData} = useAppContext();
    const colors = useColors();

    return (
        <View>
            <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 24}}>
                <FontText style={{color: colors.text.primary, fontSize: 20, fontWeight: 600, marginBottom: 12, width: "100%"}}>First Putt Bias</FontText>
                <LeftRightBias bias={statsToUse.leftRightBias} units={userData.preferences.units}/>
                <ShortPastBias bias={statsToUse.shortPastBias} units={userData.preferences.units}/>
            </ScrollView>
        </View>
    )
}