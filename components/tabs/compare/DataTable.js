import {View} from "react-native";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppCtx";
import {roundTo} from "../../../utils/roundTo";
import {formatFeetAndInches} from "../../../utils/PuttUtils";
import FontText from "../../general/FontText";

export function DataTable({stats1, stats2}) {
    const colors = useColors();
    const {userData} = useAppContext();

    const distanceUnit = userData.preferences.units === 0 ? "ft" : "m";
    const styles = {
        worseData: {
            flex: 1,
            color: "#dc3545",
            textAlign: "center",
            fontSize: 16
        },
        normalData: {
            flex: 1,
            color: colors.text.primary,
            textAlign: "center",
            fontSize: 16
        },
        betterData: {
            flex: 1,
            color: "#28a745",
            textAlign: "center",
            textDecorationLine: "underline",
            fontWeight: 600,
            fontSize: 16
        }
    }

    const getStyle = (value1, value2, isBetter) => {
        if (value1 === value2) return styles.normalData;
        return isBetter(value1, value2) ? styles.betterData : styles.worseData;
    };

    const isBetterStrokesGained = (value1, value2) => value1 > value2;
    const isBetterAvgMiss = (value1, value2) => value1 < value2;
    const isBetterMakePercentage = (value1, value2) => value1 > value2;
    const isBetterBias = (value1, value2) => Math.abs(value1) < Math.abs(value2);
    const isBetterMisreadMishits = (value1, value2) => value1 < value2;
    const isBetterOnePutts = (value1, value2) => value1 > value2;
    const isBetterThreePutts = (value1, value2) => value1 < value2;
    const isBetterMisreadPercentage = (value1, value2) => value1 < value2;

    return (
        <View style={{marginTop: 8}}>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Strokes Gained</FontText>
                <FontText style={getStyle(stats1.strokesGained.overall, stats2.strokesGained.overall, isBetterStrokesGained)}>{stats1.strokesGained.overall}</FontText>
                <FontText style={getStyle(stats2.strokesGained.overall, stats1.strokesGained.overall, isBetterStrokesGained)}>{stats2.strokesGained.overall}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Avg. Miss</FontText>
                <FontText style={getStyle(stats1.avgMiss, stats2.avgMiss, isBetterAvgMiss)}>{stats1.avgMiss} {distanceUnit}</FontText>
                <FontText style={getStyle(stats2.avgMiss, stats1.avgMiss, isBetterAvgMiss)}>{stats2.avgMiss} {distanceUnit}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Make %</FontText>
                <FontText style={getStyle((stats1.onePutts/18)*100, (stats2.onePutts/18)*100, isBetterMakePercentage)}>{roundTo((stats1.onePutts/18)*100, 0)}%</FontText>
                <FontText style={getStyle((stats2.onePutts/18)*100, (stats1.onePutts/18)*100, isBetterMakePercentage)}>{roundTo((stats2.onePutts/18)*100, 0)}%</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Left Right Bias</FontText>
                <FontText style={getStyle(stats1.leftRightBias, stats2.leftRightBias, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(stats1.leftRightBias)) : Math.abs(stats1.leftRightBias) + " m"} {stats1.leftRightBias < 0 ? "left" : "right"}</FontText>
                <FontText style={getStyle(stats2.leftRightBias, stats1.leftRightBias, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(stats2.leftRightBias)) : Math.abs(stats2.leftRightBias) + " m"} {stats2.leftRightBias < 0 ? "left" : "right"}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Short Long Bias</FontText>
                <FontText style={getStyle(stats1.shortPastBias, stats2.shortPastBias, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(stats1.shortPastBias)) : Math.abs(stats1.shortPastBias) + " m"} {stats1.shortPastBias < 0 ? "short" : "long"}</FontText>
                <FontText style={getStyle(stats2.shortPastBias, stats1.shortPastBias, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(stats2.shortPastBias)) : Math.abs(stats2.shortPastBias) + " m"} {stats2.shortPastBias < 0 ? "short" : "long"}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Misread a Round</FontText>
                <FontText style={getStyle(stats1.puttsMisread, stats2.puttsMisread, isBetterMisreadMishits)}>{stats1.puttsMisread}</FontText>
                <FontText style={getStyle(stats2.puttsMisread, stats1.puttsMisread, isBetterMisreadMishits)}>{stats2.puttsMisread}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Break Misread %</FontText>
                <FontText style={getStyle(stats1.misreads.misreadLinePercentage, stats2.misreads.misreadLinePercentage, isBetterMisreadPercentage)}>{roundTo(stats1.misreads.misreadLinePercentage*100, 0)}%</FontText>
                <FontText style={getStyle(stats2.misreads.misreadLinePercentage, stats1.misreads.misreadLinePercentage, isBetterMisreadPercentage)}>{roundTo(stats2.misreads.misreadLinePercentage*100, 0)}%</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Speed Misread %</FontText>
                <FontText style={getStyle(stats1.misreads.misreadSlopePercentage, stats2.misreads.misreadSlopePercentage, isBetterMisreadPercentage)}>{roundTo(stats1.misreads.misreadSlopePercentage*100, 0)}%</FontText>
                <FontText style={getStyle(stats2.misreads.misreadSlopePercentage, stats1.misreads.misreadSlopePercentage, isBetterMisreadPercentage)}>{roundTo(stats2.misreads.misreadSlopePercentage*100, 0)}%</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Mishits a Round</FontText>
                <FontText style={getStyle(stats1.puttsMishits, stats2.puttsMishits, isBetterMisreadMishits)}>{stats1.puttsMishits}</FontText>
                <FontText style={getStyle(stats2.puttsMishits, stats1.puttsMishits, isBetterMisreadMishits)}>{stats2.puttsMishits}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>One putts</FontText>
                <FontText style={getStyle(stats1.onePutts, stats2.onePutts, isBetterOnePutts)}>{stats1.onePutts}</FontText>
                <FontText style={getStyle(stats2.onePutts, stats1.onePutts, isBetterOnePutts)}>{stats2.onePutts}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Two putts</FontText>
                <FontText style={styles.normalData}>{stats1.twoPutts}</FontText>
                <FontText style={styles.normalData}>{stats2.twoPutts}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Three putts</FontText>
                <FontText style={getStyle(stats1.threePutts, stats2.threePutts, isBetterThreePutts)}>{stats1.threePutts}</FontText>
                <FontText style={getStyle(stats2.threePutts, stats1.threePutts, isBetterThreePutts)}>{stats2.threePutts}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Putts a hole</FontText>
                <FontText style={getStyle(stats1.puttsAHole.puttsAHole, stats2.puttsAHole.puttsAHole, isBetterThreePutts)}>{stats1.puttsAHole.puttsAHole}</FontText>
                <FontText style={getStyle(stats2.puttsAHole.puttsAHole, stats1.puttsAHole.puttsAHole, isBetterThreePutts)}>{stats2.puttsAHole.puttsAHole}</FontText>
            </View>
        </View>
    )
}

export function MiniDataTable({stats1, stats2, distance}) {
    const colors = useColors();
    const {userData} = useAppContext();

    const distanceUnit = userData.preferences.units === 0 ? "ft" : "m";
    const styles = {
        worseData: {
            flex: 1,
            color: "#dc3545",
            textAlign: "center",
            fontSize: 16
        },
        normalData: {
            flex: 1,
            color: colors.text.primary,
            textAlign: "center",
            fontSize: 16
        },
        betterData: {
            flex: 1,
            color: "#28a745",
            textAlign: "center",
            fontWeight: 600,
            textDecorationLine: "underline",
            fontSize: 16
        }
    }

    const getStyle = (value1, value2, isBetter) => {
        if (value1 === value2) return styles.normalData;
        return isBetter(value1, value2) ? styles.betterData : styles.worseData;
    };

    const isBetterStrokesGained = (value1, value2) => value1 > value2;
    const isBetterAvgMiss = (value1, value2) => value1 < value2;
    const isBetterMakePercentage = (value1, value2) => value1 > value2;
    const isBetterThreePutts = (value1, value2) => value1 < value2;
    const isBetterMisreadPercentage = (value1, value2) => value1 < value2;

    return (
        <View style={{marginTop: 8}}>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Strokes Gained</FontText>
                <FontText style={getStyle(stats1.strokesGained.distance[distance], stats2.strokesGained.distance[distance], isBetterStrokesGained)}>{stats1.strokesGained.distance[distance]}</FontText>
                <FontText style={getStyle(stats2.strokesGained.distance[distance], stats1.strokesGained.distance[distance], isBetterStrokesGained)}>{stats2.strokesGained.distance[distance]}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Avg. Miss</FontText>
                <FontText style={getStyle(stats1.avgMissDistance[distance], stats2.avgMissDistance[distance], isBetterAvgMiss)}>{stats1.avgMissDistance[distance]} {distanceUnit}</FontText>
                <FontText style={getStyle(stats2.avgMissDistance[distance], stats1.avgMissDistance[distance], isBetterAvgMiss)}>{stats2.avgMissDistance[distance]} {distanceUnit}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Make %</FontText>
                <FontText style={getStyle((stats1.madePutts.distance[distance]/18)*100, (stats2.madePutts.distance[distance]/18)*100, isBetterMakePercentage)}>{roundTo((stats1.madePutts.distance[distance]/18)*100, 0)}%</FontText>
                <FontText style={getStyle((stats2.madePutts.distance[distance]/18)*100, (stats1.madePutts.distance[distance]/18)*100, isBetterMakePercentage)}>{roundTo((stats2.madePutts.distance[distance]/18)*100, 0)}%</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Putts a hole</FontText>
                <FontText style={getStyle(stats1.puttsAHole.distance[distance], stats2.puttsAHole.distance[distance], isBetterThreePutts)}>{stats1.puttsAHole.distance[distance]}</FontText>
                <FontText style={getStyle(stats2.puttsAHole.distance[distance], stats1.puttsAHole.distance[distance], isBetterThreePutts)}>{stats2.puttsAHole.distance[distance]}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Break Misread %</FontText>
                <FontText style={getStyle(stats1.misreads.misreadLineByDistance[distance], stats2.misreads.misreadLineByDistance[distance], isBetterMisreadPercentage)}>{roundTo(stats1.misreads.misreadLineByDistance[distance]*100, 0)}%</FontText>
                <FontText style={getStyle(stats2.misreads.misreadLineByDistance[distance], stats1.misreads.misreadLineByDistance[distance], isBetterMisreadPercentage)}>{roundTo(stats2.misreads.misreadLineByDistance[distance]*100, 0)}%</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Speed Misread %</FontText>
                <FontText style={getStyle(stats1.misreads.misreadSlopeByDistance[distance], stats2.misreads.misreadSlopeByDistance[distance], isBetterMisreadPercentage)}>{roundTo(stats1.misreads.misreadSlopeByDistance[distance]*100, 0)}%</FontText>
                <FontText style={getStyle(stats2.misreads.misreadSlopeByDistance[distance], stats1.misreads.misreadSlopeByDistance[distance], isBetterMisreadPercentage)}>{roundTo(stats2.misreads.misreadSlopeByDistance[distance]*100, 0)}%</FontText>
            </View>
        </View>
    )
}