import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Circle, G, Path} from 'react-native-svg';

const ApproachAccuracyButton = ({ colors, onPress, activeButton, style }) => {
    const size = 180;
    const center = size / 2;

    const centerRadius = 35;
    const gapBetweenCenterAndArcs = 5;
    const arcInnerRadius = centerRadius + gapBetweenCenterAndArcs;
    const arcOuterRadius = 80;

    const angleGap = 5; // in degrees

    const arcs = [
        { id: 'left', x: -2, y: 0, start: 225 + angleGap / 2, end: 315 - angleGap / 2, color: colors.checkmark.background },
        { id: 'short',  x: 0, y: 2, start: 135 + angleGap / 2, end: 225 - angleGap / 2, color: colors.checkmark.background },
        { id: 'right',  x: 2, y: 0, start: 45  + angleGap / 2, end: 135 - angleGap / 2, color: colors.checkmark.background },
        { id: 'long', x: 0, y: -2, start: -45 + angleGap / 2, end: 45  - angleGap / 2, color: colors.checkmark.background },
    ];

    return (
        <View style={[styles.container, style]}>
            <Svg width={size} height={size}>
                {/* Outer Arcs */}
                {arcs.map(({ id, x, y, start, end, color }) => {
                    const arcCenterAngle = (start + end) / 2;
                    const radius = arcOuterRadius + 8; // slightly outside the arc
                    const angleRad = (arcCenterAngle - 90) * (Math.PI / 180); // rotate -90 to align vertical

                    const chevronX = center + radius * Math.cos(angleRad);
                    const chevronY = center + radius * Math.sin(angleRad);

                    return (
                        <G key={id}>
                            {/* Arc path */}
                            <Path
                                d={describeDonutArc(center, center, x, y, arcInnerRadius, arcOuterRadius, start, end)}
                                fill={activeButton === id ? color : colors.background.secondary}
                                stroke={activeButton === id ? colors.checkmark.background : colors.border.default}
                                strokeWidth={1}
                                onPressIn={() => onPress(id)}
                            />

                            {/* Chevron centered and rotated */}
                            <G
                                transform={`
                                    translate(${chevronX}, ${chevronY})
                                    rotate(${arcCenterAngle})
                                    translate(-15.5, 12)
                                    scale(1.3)
                                `}
                                onPressIn={() => onPress(id)}
                            >
                                <Path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    fill={"transparent"}
                                    stroke={activeButton === id ? "white" : colors.border.default}
                                    d="M4.5 18.75 L12 11.25 L19.5 18.75"
                                />
                                <Path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    fill={"transparent"}
                                    stroke={activeButton === id ? "white" : colors.border.default}
                                    d="M4.5 12.75 L12 5.25 L19.5 12.75"
                                />
                            </G>
                        </G>
                    );
                })}

                {/* Center Circle (Green Hit) */}
                <Circle
                    cx={center}
                    cy={center}
                    r={centerRadius}
                    fill={activeButton === "green" ? colors.checkmark.background : colors.background.secondary}
                    stroke={activeButton === "green" ? colors.checkmark.background : colors.border.default}
                    strokeWidth={1}
                    onPressIn={() => onPress('green')}
                />
                <Path
                    d={describeCheckmark(center, center)}
                    fill="none"
                    stroke={activeButton === "green" ? colors.checkmark.color : colors.border.default}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    onPress={() => onPress('green')}
                />
                {/*<Image*/}
                {/*    source={require('../../../assets/images/grassBlades.png')}*/}
                {/*    style={{*/}
                {/*        top: center - 90,*/}
                {/*        left: center - 20,*/}
                {/*        transform: [{rotate: '0deg'}],*/}
                {/*        position: 'absolute',*/}
                {/*        width: 40,*/}
                {/*        height: 40,*/}
                {/*        resizeMode: 'contain',*/}
                {/*        zIndex: 10,*/}
                {/*        tintColor: "#1d4725"*/}
                {/*    }}*/}
                {/*/>*/}
            </Svg>
        </View>
    );
};

function describeCheckmark(cx, cy) {
    // Checkmark coordinates relative to center
    const size = 24; // overall size of checkmark
    const x1 = cx - size * 0.5;
    const y1 = cy + size * 0.1;
    const x2 = cx - size * 0.1;
    const y2 = cy + size * 0.5;
    const x3 = cx + size * 0.6;
    const y3 = cy - size * 0.4;

    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`;
}

// Draws an arc between two radii (donut slice)
function describeDonutArc(x, y, innerAdjustX, innerAdjustY, innerR, outerR, startAngle, endAngle) {
    const startOuter = polarToCartesian(x, y, outerR, endAngle);
    const endOuter = polarToCartesian(x, y, outerR, startAngle);
    const startInner = polarToCartesian(x + innerAdjustX, y + innerAdjustY, innerR, startAngle);
    const endInner = polarToCartesian(x + innerAdjustX, y + innerAdjustY, innerR, endAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
        'M', startOuter.x, startOuter.y,
        'A', outerR, outerR, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
        'L', startInner.x, startInner.y,
        'A', innerR, innerR, 0, largeArcFlag, 1, endInner.x, endInner.y,
        'Z',
    ].join(' ');
}

function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
    };
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
});

export default ApproachAccuracyButton;