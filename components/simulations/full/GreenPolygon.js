import Animated, {runOnJS, useAnimatedProps, useSharedValue} from "react-native-reanimated";
import {Dimensions, Pressable, Text, View} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {isPointInPolygon} from "@/utils/courses/polygonUtils";
import {clampLineToBounds} from "@/utils/courses/boundsUtils";
import * as d3 from "d3-shape";
import Svg, {Circle, Defs, G, Line, Path, Pattern, Rect} from "react-native-svg";
import React, {useEffect, useMemo, useState} from "react";
import FontText from "../../general/FontText";

const AnimatedG = Animated.createAnimatedComponent(G);

// *** MODIFIED: The GreenPolygon component now also renders bunkers ***
const GreenPolygon = ({
                          greenCoords,
                          bunkers,
                          taps,
                          onTap,
                          setTaps,
                          bounds, // It receives the calculated bounds now
                          pinLocation,
                          userLocation,
                          fairways,
    holedOut,
    setHoledOut,
                          misreadRef
                      }) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // Store the offset at the start of each gesture
    const panStartX = useSharedValue(0);
    const panStartY = useSharedValue(0);
    const scaleStart = useSharedValue(1);
    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);
    const isPinching = useSharedValue(false);

    const [showMisread, setShowMisread] = useState(-1);

    useEffect(() => {
        console.log("showMisread changed:", showMisread);
        if (showMisread !== -1) {
            misreadRef.current?.open(showMisread, taps[showMisread]);
            setShowMisread(-1);
        }
    }, [showMisread]);

    const svgSize = Dimensions.get('window').width-48; // make it square and fit within the screen with some padding

    const toSvgPointLatLon = (coord) => {
        const x = (((coord.longitude) - bounds.minLon) / bounds.range) * svgSize;
        const y = ((bounds.maxLat - (coord.latitude)) / bounds.range) * svgSize; // Y is inverted
        return {x, y};
    }
    const computedTapPoints = useMemo(
        () => taps.map((tap) => toSvgPointLatLon(tap)),
        [taps, bounds]
    );

    const animatedProps = useAnimatedProps(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    if (!bounds || !greenCoords) return null;
    // TODO make it so when they hold and then pan, it moves the putt that is underneath their finger

    // Pinch gesture
    const pinchGesture = Gesture.Pinch()
        .onStart((event) => {
            isPinching.value = true; // pinch active
            scaleStart.value = scale.value;
            focalX.value = event.focalX;
            focalY.value = event.focalY;
        })
        .onUpdate((event) => {
            const newScale = Math.max(1, Math.min(5, scaleStart.value * event.scale));
            // Adjust translation around pinch center
            translateX.value = translateX.value + (focalX.value - focalX.value * (newScale / scale.value));
            translateY.value = translateY.value + (focalY.value - focalY.value * (newScale / scale.value));
            scale.value = newScale;
        })
        .onEnd(() => {
            isPinching.value = false; // pinch ended
        });

    const longPressGesture = Gesture.LongPress()
        .onStart((event) => {
            console.log("Long press detected at:", event.x, event.y);
            const pressThreshold = 20*scale.value; // pixels
            for (let i = 0; i < computedTapPoints.length; i++) {
                const tapPoint = computedTapPoints[i];
                console.log(`Checking tap point ${i} at:`, tapPoint.x, tapPoint.y);

                const correctedTapPointX = (tapPoint.x - translateX.value) / scale.value;
                const correctedTapPointY = (tapPoint.y - translateY.value) / scale.value;
                const correctedEventX = (event.x - translateX.value) / scale.value;
                const correctedEventY = (event.y - translateY.value) / scale.value;

                const dx = correctedTapPointX - correctedEventX;
                const dy = correctedTapPointY - correctedEventY;
                if (Math.sqrt(dx * dx + dy * dy) < pressThreshold) {
                    console.log("Long pressed on tap:", i);
                    // i is the index of tapPoint
                    runOnJS(setShowMisread)(i);
                    return;
                }
            }
        });

    // Pan gesture
    const panGesture = Gesture.Pan()
        .onStart(() => {
            panStartX.value = translateX.value;
            panStartY.value = translateY.value;
        })
        .onUpdate((event) => {
            // User is panning the green normally
            if (!isPinching.value) { // only pan if pinch not active
                translateX.value = panStartX.value + event.translationX;
                translateY.value = panStartY.value + event.translationY;
            }
        });

    // Helper to convert any LatLon to an SVG point using the provided bounds
    const toSvgPoint = (coord) => {
        const x = (((coord.x) - bounds.minLon) / bounds.range) * svgSize;
        const y = ((bounds.maxLat - (coord.y)) / bounds.range) * svgSize; // Y is inverted
        return {x, y};
    };

    const handlePress = (event) => {
        if (holedOut) {
            setHoledOut(false);
            return; // don't allow taps if holed out
        }

        const { locationX, locationY } = event.nativeEvent;

        // --- Undo pan & zoom ---
        const x = (locationX - translateX.value) / scale.value;
        const y = (locationY - translateY.value) / scale.value;

        // --- Convert to Lat/Lon ---
        const lon = (x / svgSize) * bounds.range + bounds.minLon;
        const lat = bounds.maxLat - (y / svgSize) * bounds.range;

        if (!isPointInPolygon({ latitude: lat, longitude: lon }, greenCoords)) {
            console.warn("Tapped point is outside the green polygon.");
            return;
        }

        // check to see if there is already a pin or tap within 5 pixels, if so, remove the putt
        const tapThreshold = 10; // pixels
        for (const tap of taps) {
            const tapPoint = toSvgPointLatLon(tap);
            const dx = tapPoint.x - x;
            const dy = tapPoint.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < tapThreshold) {
                setTaps(taps.filter(t => t.latitude !== tap.latitude || t.longitude !== tap.longitude));
                return;
            }
        }

        onTap({ latitude: lat, longitude: lon });
    };

    const clippedFairway = clampLineToBounds(fairways, bounds);
    const fairwayPoints = clippedFairway.map(c =>
        c.map(p => {
            const svgPoint = toSvgPointLatLon(p);
            return [svgPoint.x, svgPoint.y]; //return `${p.x},${p.y}`;
        })
    );

    const greenPoints = greenCoords.map(c => {
        const p = toSvgPoint(c);
        return [p.x, p.y]; //return `${p.x},${p.y}`;
    });

    const lineGenerator = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveCatmullRomClosed); // smooth closed curve

    const greenPathData = lineGenerator(greenPoints);

    return (
        <Pressable onPress={handlePress}>
            {(holedOut) && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: [{ translateX: -svgSize / 2 }],
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 99,
                    borderRadius: 12,
                    aspectRatio: 1,
                    width: svgSize
                }}>
                    <FontText style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>
                        {holedOut ? "You holed out" : "Miss logged as >3ft"}
                    </FontText>
                    <FontText style={{ fontSize: 14, color: '#555' }}>
                        No need to mark your putts
                    </FontText>
                    <FontText style={{ fontSize: 14, color: '#555' }}>
                        If you want to override that, tap on grid.
                    </FontText>
                </View>
            )}
            <GestureDetector gesture={Gesture.Simultaneous(longPressGesture, panGesture, pinchGesture)}>
                <Animated.View>
                    <Svg width={svgSize} height={svgSize} style={{backgroundColor: "#246903", borderRadius: 12}} >
                        <AnimatedG animatedProps={animatedProps}>
                            <Defs>
                                <Pattern
                                    id="greenPattern"
                                    patternUnits="userSpaceOnUse"
                                    width="40"
                                    height="40"
                                    patternTransform="rotate(45)"
                                >
                                    <Rect width="40" height="40" fill="#35aa03"/>
                                    <Rect width="20" height="40" fill="#259704" opacity={0.4}/>
                                    <Rect width="40" height="20" fill="#259704" opacity={0.4}/>
                                </Pattern>
                                <Pattern
                                    id="fairwayPattern"
                                    patternUnits="userSpaceOnUse"
                                    width="40"
                                    height="40"
                                    patternTransform="rotate(-45)"
                                >
                                    <Rect width="40" height="40" fill="#43ac0a"/>
                                    <Rect width="20" height="40" fill="#2a9100" opacity={0.4}/>
                                </Pattern>
                            </Defs>
                            {fairwayPoints.map((fairway, index) => {
                                return <Path key={"fairway-" + index} d={lineGenerator(fairway)} fill="url(#fairwayPattern)"/>
                            })}
                            <Path d={greenPathData} fill="url(#greenPattern)" stroke={"black"} strokeWidth={1.5}/>
                            {bunkers.map((bunkerCoords, index) => {
                                const bunkerPoints = bunkerCoords.coordinates.map(c => {
                                    const p = toSvgPointLatLon(c);
                                    return [p.x, p.y];
                                });

                                const bunkerPathData = lineGenerator(bunkerPoints);

                                return (
                                    <Path key={`bunker-${index}`} d={bunkerPathData} fill="#D2B48C"/>
                                );
                            })}

                            {computedTapPoints.map((tap, index) => {
                                const nextPoint = computedTapPoints[index + 1] ? computedTapPoints[index + 1] : toSvgPointLatLon(pinLocation) ? toSvgPointLatLon(pinLocation) : null;

                                if (!nextPoint) return null;

                                return (
                                    <Line
                                        key={`line-${index}`}
                                        x1={tap.x}
                                        y1={tap.y}
                                        x2={nextPoint.x}
                                        y2={nextPoint.y}
                                        stroke="blue"
                                        strokeWidth={2}
                                    />
                                );
                            })}

                            { userLocation !== null && (
                                    <Circle
                                        cx={toSvgPointLatLon(userLocation).x}
                                        cy={toSvgPointLatLon(userLocation).y}
                                        r={6}
                                        fill="#76eeff"
                                        stroke="black"
                                        strokeWidth={1}
                                    />
                                )
                            }

                            {taps.map((tap, index) => {
                                const p = toSvgPointLatLon(tap);
                                return (
                                    <React.Fragment key={"tap-" + index}>
                                        <Circle
                                            cx={p.x}
                                            cy={p.y}
                                            r={5}
                                            fill={tap.misreadLine || tap.misreadSlope ? "red" : "white"}
                                            stroke="black"
                                            strokeWidth={1}
                                        />
                                        <Text
                                            style={{color: tap.misreadLine || tap.misreadSlope ? "white" : "black", position: "absolute", left: p.x-3, top: p.y - 7, fontSize: 10, fontWeight: "bold"}}
                                        >
                                            {index + 1}
                                        </Text>
                                    </React.Fragment>
                                );
                            })}
                            {pinLocation && (
                                <>
                                    <Circle
                                        cx={toSvgPointLatLon(pinLocation).x}
                                        cy={toSvgPointLatLon(pinLocation).y}
                                        r={7}
                                        fill="white"
                                        stroke="black"
                                        strokeWidth={1}
                                    />
                                    <Path scale={0.35} x={toSvgPointLatLon(pinLocation).x-4} y={toSvgPointLatLon(pinLocation).y-4} fillRule="evenodd"
                                          d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
                                          clipRule="evenodd"/>
                                </>
                            )}
                        </AnimatedG>
                    </Svg>
                </Animated.View>
            </GestureDetector>
        </Pressable>
    );
};

export {GreenPolygon}