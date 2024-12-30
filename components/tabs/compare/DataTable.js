import {Text, View} from "react-native";
import useColors from "../../../hooks/useColors";
import {useAppContext} from "../../../contexts/AppCtx";
import {roundTo} from "../../../utils/roundTo";
import {formatFeetAndInches} from "../../../utils/PuttUtils";

export function DataTable({stats1, stats2, type}) {
    const colors = useColors();
    const {userData} = useAppContext();

    const distanceUnit = userData.preferences.units === 0 ? "ft" : "m";
    const styles = {
        normalData: {
            flex: 1,
            color: colors.text.primary,
            textAlign: "center",
            fontSize: 16
        },
        betterData: {
            flex: 1,
            color: colors.text.primary,
            textAlign: "center",
            fontWeight: 600,
            textDecorationLine: "underline",
            fontSize: 16
        }
    }

    const getStyle = (value1, value2, isBetter) => {
        return isBetter(value1, value2) ? styles.betterData : styles.normalData;
    };

    const isBetterStrokesGained = (value1, value2) => value1 > value2;
    const isBetterAvgMiss = (value1, value2) => value1 < value2;
    const isBetterMakePercentage = (value1, value2) => value1 > value2;
    const isBetterBias = (value1, value2) => Math.abs(value1) < Math.abs(value2);
    const isBetterMisreadMishits = (value1, value2) => value1 < value2;
    const isBetterOnePutts = (value1, value2) => value1 > value2;
    const isBetterThreePutts = (value1, value2) => value1 < value2;

    return (
        <View style={{marginTop: 8}}>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Strokes Gained</Text>
                <Text style={getStyle(stats1.strokesGained.overall, stats2.strokesGained.overall, isBetterStrokesGained)}>{stats1.strokesGained.overall}</Text>
                <Text style={getStyle(stats2.strokesGained.overall, stats1.strokesGained.overall, isBetterStrokesGained)}>{stats2.strokesGained.overall}</Text>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Avg. Miss</Text>
                <Text style={getStyle(stats1.avgMiss, stats2.avgMiss, isBetterAvgMiss)}>{stats1.avgMiss} {distanceUnit}</Text>
                <Text style={getStyle(stats2.avgMiss, stats1.avgMiss, isBetterAvgMiss)}>{stats2.avgMiss} {distanceUnit}</Text>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Make %</Text>
                <Text style={getStyle((stats1.onePutts/18)*100, (stats2.onePutts/18)*100, isBetterMakePercentage)}>{roundTo((stats1.onePutts/18)*100, 0)}%</Text>
                <Text style={getStyle((stats2.onePutts/18)*100, (stats1.onePutts/18)*100, isBetterMakePercentage)}>{roundTo((stats2.onePutts/18)*100, 0)}%</Text>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Left Right Bias</Text>
                <Text style={getStyle(stats1.leftRightBias, stats2.leftRightBias, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(stats1.leftRightBias)) : Math.abs(stats1.leftRightBias) + " m"} {stats1.leftRightBias < 0 ? "left" : "right"}</Text>
                <Text style={getStyle(stats2.leftRightBias, stats1.leftRightBias, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(stats2.leftRightBias)) : Math.abs(stats2.leftRightBias) + " m"} {stats2.leftRightBias < 0 ? "left" : "right"}</Text>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Short Long Bias</Text>
                <Text style={getStyle(stats1.shortPastBias, stats2.shortPastBias, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(stats1.shortPastBias)) : Math.abs(stats1.shortPastBias) + " m"} {stats1.shortPastBias < 0 ? "short" : "long"}</Text>
                <Text style={getStyle(stats2.shortPastBias, stats1.shortPastBias, isBetterBias)}>{userData.preferences.units === 0 ? formatFeetAndInches(Math.abs(stats2.shortPastBias)) : Math.abs(stats2.shortPastBias) + " m"} {stats2.shortPastBias < 0 ? "short" : "long"}</Text>
            </View>
            {
                type !== "putters" && (
                    <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                        <Text style={{flex: 1, color: colors.text.primary}}>Misread a Round</Text>
                        <Text style={getStyle(stats1.puttsMisread, stats2.puttsMisread, isBetterMisreadMishits)}>{stats1.puttsMisread}</Text>
                        <Text style={getStyle(stats2.puttsMisread, stats1.puttsMisread, isBetterMisreadMishits)}>{stats2.puttsMisread}</Text>
                    </View>
                )
            }
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Mishits a Round</Text>
                <Text style={getStyle(stats1.puttsMishits, stats2.puttsMishits, isBetterMisreadMishits)}>{stats1.puttsMishits}</Text>
                <Text style={getStyle(stats2.puttsMishits, stats1.puttsMishits, isBetterMisreadMishits)}>{stats2.puttsMishits}</Text>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>One putts</Text>
                <Text style={getStyle(stats1.onePutts, stats2.onePutts, isBetterOnePutts)}>{stats1.onePutts}</Text>
                <Text style={getStyle(stats2.onePutts, stats1.onePutts, isBetterOnePutts)}>{stats2.onePutts}</Text>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Two putts</Text>
                <Text style={styles.normalData}>{stats1.twoPutts}</Text>
                <Text style={styles.normalData}>{stats2.twoPutts}</Text>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Three putts</Text>
                <Text style={getStyle(stats1.threePutts, stats2.threePutts, isBetterThreePutts)}>{stats1.threePutts}</Text>
                <Text style={getStyle(stats2.threePutts, stats1.threePutts, isBetterThreePutts)}>{stats2.threePutts}</Text>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Putts a hole</Text>
                <Text style={getStyle(stats1.puttsAHole.puttsAHole, stats2.puttsAHole.puttsAHole, isBetterThreePutts)}>{stats1.puttsAHole.puttsAHole}</Text>
                <Text style={getStyle(stats2.puttsAHole.puttsAHole, stats1.puttsAHole.puttsAHole, isBetterThreePutts)}>{stats2.puttsAHole.puttsAHole}</Text>
            </View>
        </View>
    )
}

export function MiniDataTable({stats1, stats2, type, distance}) {
    const colors = useColors();
    const {userData} = useAppContext();

    const distanceUnit = userData.preferences.units === 0 ? "ft" : "m";
    const styles = {
        normalData: {
            flex: 1,
            color: colors.text.primary,
            textAlign: "center",
            fontSize: 16
        },
        betterData: {
            flex: 1,
            color: colors.text.primary,
            textAlign: "center",
            fontWeight: 600,
            textDecorationLine: "underline",
            fontSize: 16
        }
    }

    const getStyle = (value1, value2, isBetter) => {
        return isBetter(value1, value2) ? styles.betterData : styles.normalData;
    };

    const isBetterStrokesGained = (value1, value2) => value1 > value2;
    const isBetterAvgMiss = (value1, value2) => value1 < value2;
    const isBetterMakePercentage = (value1, value2) => value1 > value2;
    const isBetterThreePutts = (value1, value2) => value1 < value2;

    return (
        <View style={{marginTop: 8}}>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Strokes Gained</Text>
                <Text style={getStyle(stats1.strokesGained.distance[distance], stats2.strokesGained.distance[distance], isBetterStrokesGained)}>{stats1.strokesGained.distance[distance]}</Text>
                <Text style={getStyle(stats2.strokesGained.distance[distance], stats1.strokesGained.distance[distance], isBetterStrokesGained)}>{stats2.strokesGained.distance[distance]}</Text>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Avg. Miss</Text>
                <Text style={getStyle(stats1.avgMissDistance[distance], stats2.avgMissDistance[distance], isBetterAvgMiss)}>{stats1.avgMissDistance[distance]} {distanceUnit}</Text>
                <Text style={getStyle(stats2.avgMissDistance[distance], stats1.avgMissDistance[distance], isBetterAvgMiss)}>{stats2.avgMissDistance[distance]} {distanceUnit}</Text>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Make %</Text>
                <Text style={getStyle((stats1.madePutts.distance[distance]/18)*100, (stats2.madePutts.distance[distance]/18)*100, isBetterMakePercentage)}>{roundTo((stats1.madePutts.distance[distance]/18)*100, 0)}%</Text>
                <Text style={getStyle((stats2.madePutts.distance[distance]/18)*100, (stats1.madePutts.distance[distance]/18)*100, isBetterMakePercentage)}>{roundTo((stats2.madePutts.distance[distance]/18)*100, 0)}%</Text>
            </View>
            <View style={{flexDirection: "row", borderTopWidth: 1, borderColor: colors.border.default, paddingVertical: 8}}>
                <Text style={{flex: 1, color: colors.text.primary}}>Putts a hole</Text>
                <Text style={getStyle(stats1.puttsAHole.distance[distance], stats2.puttsAHole.distance[distance], isBetterThreePutts)}>{stats1.puttsAHole.distance[distance]}</Text>
                <Text style={getStyle(stats2.puttsAHole.distance[distance], stats1.puttsAHole.distance[distance], isBetterThreePutts)}>{stats2.puttsAHole.distance[distance]}</Text>
            </View>
        </View>
    )
}