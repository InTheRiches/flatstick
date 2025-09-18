import {View} from "react-native";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppContext";
import {roundTo} from "../../../utils/roundTo";
import {formatFeetAndInches} from "../../../utils/PuttUtils";
import FontText from "../../general/FontText";
import {convertUnits} from "../../../utils/Conversions";

export function DataTable({stats1, stats2}) {
    const colors = useColors();
    const {userData} = useAppContext();

    console.log("Stats1:", stats1);

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

    const strokesGained1 = roundTo((stats1.strokesGained.expectedStrokes - stats1.totalPutts) / (stats1.holesPlayed / 18), 1);
    const strokesGained2 = roundTo((stats2.strokesGained.expectedStrokes - stats2.totalPutts) / (stats2.holesPlayed / 18), 1);
    const avgMiss1 = roundTo(convertUnits(stats1.missData.totalMissDistance / stats1.missData.totalMissedPutts, 0, userData.preferences.units), 1);
    const avgMiss2 = roundTo(convertUnits(stats2.missData.totalMissDistance / stats2.missData.totalMissedPutts, 0, userData.preferences.units), 1);
    const makePercent1 = roundTo(stats1.averageRound.onePutts / (stats1.holesPlayed), 1);
    const makePercent2 = roundTo(stats2.averageRound.onePutts / (stats2.holesPlayed), 1);
    const leftRightBias1 = roundTo(convertUnits((stats1.missData.totalLongMiss / stats1.missData.totalMissedPutts) / 12, 0, userData.preferences.units), 1);
    const leftRightBias2 = roundTo(convertUnits((stats2.missData.totalLongMiss / stats2.missData.totalMissedPutts) / 12, 0, userData.preferences.units), 1);
    const shortLongBias1 = roundTo(convertUnits((stats1.missData.totalLatMiss / stats1.missData.totalMissedPutts) / 12, 0, userData.preferences.units), 1);
    const shortLongBias2 = roundTo(convertUnits((stats2.missData.totalLatMiss / stats2.missData.totalMissedPutts) / 12, 0, userData.preferences.units), 1);
    const misreadsARound1 = roundTo(stats1.misreadData.totalMisreads / (stats1.holesPlayed / 18), 1);
    const misreadsARound2 = roundTo(stats2.misreadData.totalMisreads / (stats2.holesPlayed / 18), 1);
    const lineMisreads1 = roundTo(stats1.misreadData.totalLineMisreads / (stats1.holesPlayed / 18), 1);
    const lineMisreads2 = roundTo(stats2.misreadData.totalLineMisreads / (stats2.holesPlayed / 18), 1);
    const speedMisreads1 = roundTo(stats1.misreadData.totalSlopeMisreads / (stats1.holesPlayed / 18), 1);
    const speedMisreads2 = roundTo(stats2.misreadData.totalSlopeMisreads / (stats2.holesPlayed / 18), 1);
    const onePutts1 = roundTo(stats1.averageRound.onePutts / (stats1.holesPlayed / 18), 1);
    const onePutts2 = roundTo(stats2.averageRound.onePutts / (stats2.holesPlayed / 18), 1);
    const twoPutts1 = roundTo(stats1.averageRound.twoPutts / (stats1.holesPlayed / 18), 1);
    const twoPutts2 = roundTo(stats2.averageRound.twoPutts / (stats2.holesPlayed / 18), 1);
    const threePutts1 = roundTo(stats1.averageRound.threePlusPutts / (stats1.holesPlayed / 18), 1);
    const threePutts2 = roundTo(stats2.averageRound.threePlusPutts / (stats2.holesPlayed / 18), 1);
    const puttsAHole1 = roundTo(stats1.totalPutts / (stats1.holesPlayed), 1);
    const puttsAHole2 = roundTo(stats2.totalPutts / (stats2.holesPlayed), 1);

    return (
        <View style={{marginTop: 8}}>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Strokes Gained</FontText>
                <FontText style={getStyle(strokesGained1, strokesGained2, isBetterStrokesGained)}>{strokesGained1}</FontText>
                <FontText style={getStyle(strokesGained2, strokesGained1, isBetterStrokesGained)}>{strokesGained2}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Avg. Miss</FontText>
                <FontText style={getStyle(avgMiss1, avgMiss2, isBetterAvgMiss)}>{avgMiss1} {distanceUnit}</FontText>
                <FontText style={getStyle(avgMiss2, avgMiss1, isBetterAvgMiss)}>{avgMiss2} {distanceUnit}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Make %</FontText>
                <FontText style={getStyle((makePercent1)*100, (makePercent2)*100, isBetterMakePercentage)}>{roundTo((makePercent1)*100, 0)}%</FontText>
                <FontText style={getStyle((makePercent2)*100, (makePercent1)*100, isBetterMakePercentage)}>{roundTo((makePercent2)*100, 0)}%</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Left Right Bias</FontText>
                <FontText style={getStyle(leftRightBias1, leftRightBias2, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(leftRightBias1)) : Math.abs(leftRightBias1) + " m"} {leftRightBias1 < 0 ? "left" : "right"}</FontText>
                <FontText style={getStyle(leftRightBias2, leftRightBias1, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(leftRightBias2)) : Math.abs(leftRightBias2) + " m"} {leftRightBias2 < 0 ? "left" : "right"}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Short Long Bias</FontText>
                <FontText style={getStyle(shortLongBias1, shortLongBias2, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(shortLongBias1)) : Math.abs(shortLongBias1) + " m"} {shortLongBias1 < 0 ? "short" : "long"}</FontText>
                <FontText style={getStyle(shortLongBias2, shortLongBias1, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(shortLongBias2)) : Math.abs(shortLongBias2) + " m"} {shortLongBias2 < 0 ? "short" : "long"}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Misread / Round</FontText>
                <FontText style={getStyle(misreadsARound1, misreadsARound2, isBetterMisreadMishits)}>{misreadsARound1}</FontText>
                <FontText style={getStyle(misreadsARound2, misreadsARound1, isBetterMisreadMishits)}>{misreadsARound2}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Break Misreads / Round</FontText>
                <FontText style={getStyle(lineMisreads1, lineMisreads2, isBetterMisreadPercentage)}>{roundTo(lineMisreads1*100, 0)}%</FontText>
                <FontText style={getStyle(lineMisreads2, lineMisreads1, isBetterMisreadPercentage)}>{roundTo(lineMisreads2*100, 0)}%</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Speed Misreads / Round</FontText>
                <FontText style={getStyle(speedMisreads1, speedMisreads2, isBetterMisreadPercentage)}>{roundTo(speedMisreads1*100, 0)}%</FontText>
                <FontText style={getStyle(speedMisreads2, speedMisreads1, isBetterMisreadPercentage)}>{roundTo(speedMisreads2*100, 0)}%</FontText>
            </View>
            {/*<View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>*/}
            {/*    <FontText style={{flex: 1, color: colors.text.primary}}>Mishits a Round</FontText>*/}
            {/*    <FontText style={getStyle(stats1.puttsMishits, stats2.puttsMishits, isBetterMisreadMishits)}>{stats1.puttsMishits}</FontText>*/}
            {/*    <FontText style={getStyle(stats2.puttsMishits, stats1.puttsMishits, isBetterMisreadMishits)}>{stats2.puttsMishits}</FontText>*/}
            {/*</View>*/}
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>1 Putts / Round</FontText>
                <FontText style={getStyle(onePutts1, onePutts2, isBetterOnePutts)}>{onePutts1}</FontText>
                <FontText style={getStyle(onePutts2, onePutts1, isBetterOnePutts)}>{onePutts2}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>2 Putts / Round</FontText>
                <FontText style={styles.normalData}>{twoPutts1}</FontText>
                <FontText style={styles.normalData}>{twoPutts2}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>3 Putts / Round</FontText>
                <FontText style={getStyle(threePutts1, threePutts2, isBetterThreePutts)}>{threePutts1}</FontText>
                <FontText style={getStyle(threePutts2, threePutts1, isBetterThreePutts)}>{threePutts2}</FontText>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <FontText style={{flex: 1, color: colors.text.primary}}>Putts / Hole</FontText>
                <FontText style={getStyle(puttsAHole1, puttsAHole2, isBetterThreePutts)}>{puttsAHole1}</FontText>
                <FontText style={getStyle(puttsAHole2, puttsAHole1, isBetterThreePutts)}>{puttsAHole2}</FontText>
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