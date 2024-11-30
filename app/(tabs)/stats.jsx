import {ScrollView, Text, View} from "react-native";
import useColors from "../../hooks/useColors";
import RadarChart from "../../components/graphs/SpiderGraph";
import {useAppContext} from "../../contexts/AppCtx";
import {useEffect, useState} from "react";
import {BarChart} from "react-native-gifted-charts";

export default function Stats({}) {
    const colors = useColors();

    const {userData, currentStats, getAllStats, updateStats} = useAppContext();

    console.log(currentStats);

    return (
        <ScrollView>
            <View style={{
                height: "100%",
                flex: 1,
                overflow: "hidden",
                flexDirection: "column",
                alignContent: "center",
                borderBottomWidth: 1,
                borderBottomColor: colors.border.default,
                paddingHorizontal: 20,
                backgroundColor: colors.background.primary,
            }}>
                <Text style={{color: colors.text.secondary, fontSize: 16}}>View Your</Text>
                <Text style={{
                    fontSize: 24,
                    fontWeight: 500,
                    color: colors.text.primary
                }}>Stats</Text>
                <MakeBarChart currentStats={currentStats}></MakeBarChart>
                <MissDistribution currentStats={currentStats}/>
            </View>
        </ScrollView>
    )
}

function MakeBarChart({currentStats}) {
    if (currentStats === undefined || Object.keys(currentStats).length === 0) {
        return <View></View>
    }

    const data = [{
        value: currentStats.lessThanSix.percentMade,
        label: "< 6ft",
        labelTextStyle: {color: 'white'},

    }, {
        value: currentStats.sixToTwelve.percentMade,
        label: "6 - 12ft",
        labelTextStyle: {color: 'white'},

    }, {
        value: currentStats.twelveToTwenty.percentMade,
        label: "12 - 20ft",
        labelTextStyle: {color: 'white'},

    }, {
        value: currentStats.twentyPlus.percentMade,
        label: "> 20ft",
        labelTextStyle: {color: 'white'},

    }]

    return (
        <BarChart barWidth={22}
                  noOfSections={3}
                  barBorderRadius={4}
                  barBorderBottomLeftRadius={0}
                  barBorderBottomRightRadius={0}
                  frontColor="#D0C597"
                  roundedBottom={false}
                  xAxisThickness={1}
                  xAxisColor={"white"}
                  formatYLabel={(label) => label + "%"}
                  yAxisTextStyle={{color: 'white'}}
                  yAxisColor={"white"}
                  yAxisThickness={1}
                  width={264}
                  disablePress={true}
                  initialSpacing={24}
                  spacing={48}
                  data={data}/>
    )
}

function MissDistribution({currentStats}) {
    if (currentStats === undefined || Object.keys(currentStats).length === 0) {
        return <View></View>
    }

    return (
        <RadarChart graphSize={400}
                    scaleCount={4}
                    numberInterval={0}
                    data={[
                        (() => {
                            let totalPutts = currentStats.lessThanSix.totalPutts;
                            if (totalPutts === 0)
                                totalPutts = 1; // TODO ADD A PLACEHOLDER OR SOMETHING SAYING THERE IS NO DATA
                            const missDistribution = currentStats.lessThanSix.missDistribution.map(
                                (value) => value / totalPutts
                            );

                            const maxPercentage = Math.max(...missDistribution) + 0.01;

                            console.log("miss: " + missDistribution);

                            return {
                                "Past": missDistribution[0] / maxPercentage,
                                "Past Right": missDistribution[1] / maxPercentage,
                                "Right": missDistribution[2] / maxPercentage,
                                "Short Right": missDistribution[3] / maxPercentage,
                                "Short": missDistribution[4] / maxPercentage,
                                "Short Left": missDistribution[5] / maxPercentage,
                                "Left": missDistribution[6] / maxPercentage,
                                "Past Left": missDistribution[7] / maxPercentage,
                            };
                        })(),
                    ]}
                    options={{
                        graphShape: 1,
                        showAxis: true,
                        showIndicator: true,
                        colorList: ["#D0C597", "red"],
                        dotList: [false, true],
                    }}></RadarChart>
    )
}