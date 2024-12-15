import React from "react";
import Svg, {G, Path, Polyline, Text} from "react-native-svg";
import {useColorScheme, View} from "react-native";
import useColors from "../../../hooks/useColors";

export default function RadarChart({
                                       graphSize,
                                       scaleCount,
                                       numberInterval,
                                       data,
                                       options,
                                   }) {
    const colorScheme = useColorScheme();
    const colors = useColors();

    const boxSize = graphSize * 3;
    const centerPos = boxSize / 2;

    // Top start pos -90 degree
    const posX = (angle, distance) =>
        Math.cos(angle - Math.PI / 2) * distance * graphSize;
    const posY = (angle, distance) =>
        Math.sin(angle - Math.PI / 2) * distance * graphSize;

    const initPath = (points) => {
        let d = "M" + points[0][0].toFixed(4) + "," + points[0][1].toFixed(4);
        for (let i = 1; i < points.length; i++) {
            d += "L" + points[i][0].toFixed(4) + "," + points[i][1].toFixed(4);
        }
        return d + "z";
    };

    const scaleShape = (columns, i) => {
        return (
            <Path
                key={`shape-${i}`}
                d={initPath(
                    columns.map((column) => {
                        return [
                            posX(column.angle, i / scaleCount),
                            posY(column.angle, i / scaleCount),
                        ];
                    })
                )}
                stroke={`#928481`}
                fill={`#222222`}
                fillOpacity={colorScheme === "light" ? "0.05" : ".5"}
            />
        );
    };

    const shape = (columns) => (chartData, i) => {
        const data = chartData;
        const colorCode = options.colorList[i];
        const dot = options.dotList[i] === true ? "20,20" : "0,0";
        return (
            <Path
                key={`shape-${i}`}
                d={initPath(
                    columns.map((column) => {
                        // check where the data is an array or a single value
                        if (Array.isArray(data[column.key])) {
                            return [
                                posX(column.angle, data[column.key][0]),
                                posY(column.angle, data[column.key][0]),
                            ];
                        }

                        return [
                            posX(column.angle, data[column.key]),
                            posY(column.angle, data[column.key]),
                        ];
                    })
                )}
                strokeDasharray={dot}
                stroke={colorCode}
                strokeWidth="5"
                fill={colorCode}
                fillOpacity="0.2"
            />
        );
    };

    const points = (points) => {
        return points
            .map((point) => point[0].toFixed(4) + "," + point[1].toFixed(4))
            .join(" ");
    };

    const axis = () => (column, i) => {
        return (
            <Polyline
                key={`poly-axis-${i}`}
                points={points([
                    [0, 0],
                    [posX(column.angle, 1.1), posY(column.angle, 1.1)],
                ])}
                stroke="#000000"
                strokeWidth=".1"
            />
        );
    };

    const label = () => (column) => {
        const isArray = Array.isArray(data[0][column.key]);

        return (
            <View key={"label-view-of-" + column.key}>
                {
                    // split the text by "\n" and make a new one for each line
                    column.key.split("\n").map((text, i) => (
                        <Text
                            key={`label2-of-${text}`}
                            x={posX(column.angle, 1.17)}
                            y={posY(column.angle, 1.2) - (i*50) - ((data[0][column.key].length-2) * 25)}
                            dy={10 / 2}
                            fill={colors.text.primary}
                            fontWeight="500"
                            fontSize="48"
                            textAnchor="middle"
                        >
                            {text}
                        </Text>
                    ))
                }
                {isArray &&
                    <Text
                        key={`label1-of-${data[0][column.key][1]}`}
                        x={posX(column.angle, 1.17)}
                        y={posY(column.angle, 1.2) + 50 - ((data[0][column.key].length-2) * 25)}
                        dy={10 / 2}
                        fill={"#24b2ff"}
                        fontWeight="500"
                        fontSize="44"
                        textAnchor="middle"
                    >
                        {data[0][column.key][1]}
                    </Text>}
                {isArray && data[0][column.key].length > 2 &&
                    <Text
                        key={`label1-of-${data[0][column.key][2]}`}
                        x={posX(column.angle, 1.17)}
                        y={posY(column.angle, 1.2) + 100 - ((data[0][column.key].length-2) * 25)}
                        dy={10 / 2}
                        fill={"#24b2ff"}
                        fontWeight="500"
                        fontSize="44"
                        textAnchor="middle"
                    >
                        {data[0][column.key][2]}
                    </Text>
                }
            </View>
        );
    };

    const textIndicator = (i) => {
        return (
            <Text
                x={-20}
                y={-((i / scaleCount) * graphSize)}
                fill="white"
                fontWeight="bold"
                fontSize="36"
                textAnchor="middle"
            >
                {i}
            </Text>
        );
    };

    const groups = [];
    const labels = Object.keys(data[0]);

    const columns = labels.map((key, i, arr) => {
        return {
            key,
            angle: (Math.PI * 2 * i) / arr.length,
        };
    });

    for (let i = scaleCount; i >= 0; i--) {
        groups.push(<G key={"groupShape-" + i}>{scaleShape(columns, i)}</G>);
    }

    groups.push(<G key={`groups`}>{data.map(shape(columns))}</G>);
    groups.push(<G key={`group-captions`}>{columns.map(label())}</G>);

    if (options.showAxis)
        groups.push(<G key={`group-axes`}>{columns.map(axis())}</G>);

    if (options.showIndicator) {
        for (let i = 0; i <= scaleCount; i++) {
            if (i % numberInterval === 0)
                groups.push(<G key={`group-${i}`}>{textIndicator(i)}</G>);
        }
    }
    return (
        <Svg
            version="1"
            xmlns="http://www.w3.org/2000/svg"
            width={graphSize}
            height={graphSize}
            viewBox={`0 0 ${boxSize} ${boxSize}`}
        >
            <G transform={`translate(${centerPos},${centerPos})`}>{groups}</G>
        </Svg>
    );
}