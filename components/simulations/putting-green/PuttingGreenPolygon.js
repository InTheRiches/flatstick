import Animated, {runOnJS, useAnimatedProps, useSharedValue} from "react-native-reanimated";
import {Dimensions, Platform, Pressable} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import * as d3 from "d3-shape";
import Svg, {Circle, Defs, G, Line, Path, Pattern, Rect} from "react-native-svg";
import React, {useEffect, useMemo, useState} from "react";
import {isPointInPolygonLatLon} from "../../../utils/courses/polygonUtils";
import * as Location from "expo-location";

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// *** MODIFIED: The GreenPolygon component now also renders bunkers ***
const PuttingGreenPolygon = ({
                          greenCoords,
                          taps,
                          onTap,
                          setTaps,
                          bounds, // It receives the calculated bounds now
                          pinLocations,
                          setPinLocations,
                          userLocation,
                          selectedHole,
                          misreadRef,
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

    const heading = useSharedValue(0); // in degrees

    useEffect(() => {
        let subscription;

        (async () => {
            subscription = await Location.watchHeadingAsync((headingData) => {
                if (headingData && headingData.trueHeading != null) {
                    heading.value = headingData.trueHeading;
                }
            });
        })();

        return () => {
            subscription?.remove(); // clean up on unmount
        };
    }, []);

    useEffect(() => {
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
        () => selectedHole ? [ toSvgPointLatLon(selectedHole.start), ...taps.map((tap) => toSvgPointLatLon(tap))] : taps.map((tap) => toSvgPointLatLon(tap)),
        [taps, selectedHole, showMisread]
    );

    const animatedProps = useAnimatedProps(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const inverseAnimatedProps = useAnimatedProps(() => {
        return {
            r: 6 / scale.value, // shrink radius as parent grows
            strokeWidth: 1 / scale.value, // keep stroke width consistent
        };
    }, []);

    const inverseAnimatedPropsG = useAnimatedProps(() => {
        if (userLocation === null) return {};

        const x = (((userLocation.longitude) - bounds.minLon) / bounds.range) * svgSize;
        const y = ((bounds.maxLat - (userLocation.latitude)) / bounds.range) * svgSize; // Y is inverted

        return {
            scale: 1 / scale.value, // keep stroke width consistent
            x: x,
            y: y,
            transform: [
                { rotate: `${heading.value}deg` },
            ]
        };
    }, [heading]);

    if (!bounds || !greenCoords) return null;

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
            // --- Undo pan & zoom ---
            const x = (event.x - translateX.value) / scale.value;
            const y = (event.y - translateY.value) / scale.value;

            // --- Convert to Lat/Lon ---
            const lon = (x / svgSize) * bounds.range + bounds.minLon;
            const lat = bounds.maxLat - (y / svgSize) * bounds.range;

            // check to see if there is already a pin or tap within 5 pixels, if so, remove the putt
            const tapThreshold = 10; // pixels
            for (let i = 0; i < computedTapPoints.length; i++) {
                const tapPoint = computedTapPoints[i];
                const dx = tapPoint.x - x;
                const dy = tapPoint.y - y;
                if (Math.sqrt(dx * dx + dy * dy) < tapThreshold) {
                    runOnJS(setShowMisread)(i-1);
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
        const { locationX, locationY } = event.nativeEvent;

        // --- Undo pan & zoom ---
        const x = (locationX - translateX.value) / scale.value;
        const y = (locationY - translateY.value) / scale.value;

        // --- Convert to Lat/Lon ---
        const lon = (x / svgSize) * bounds.range + bounds.minLon;
        const lat = bounds.maxLat - (y / svgSize) * bounds.range;

        if (!isPointInPolygonLatLon({ latitude: lat, longitude: lon }, greenCoords)) {
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
        if (!selectedHole) {
            for (const tap of pinLocations) {
                const tapPoint = toSvgPointLatLon(tap);
                const dx = tapPoint.x - x;
                const dy = tapPoint.y - y;
                if (Math.sqrt(dx * dx + dy * dy) < tapThreshold) {
                    setPinLocations(pinLocations.filter(t => t.latitude !== tap.latitude || t.longitude !== tap.longitude));
                    return;
                }
            }
        }

        onTap({ latitude: lat, longitude: lon });
        // delay 0 ms to ensure tap is added before opening misread
        setTimeout(() => {
            scale.value = scale.value+0.001; // trigger re-calculation of inverseAnimatedProps
        }, 100);
    };

    const greenPoints = greenCoords.map(c => {
        const p = toSvgPointLatLon(c);
        return [p.x, p.y]; //return `${p.x},${p.y}`;
    });

    const lineGenerator = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveCatmullRomClosed); // smooth closed curve

    const greenPathData = lineGenerator(greenPoints);

    return (
        <Pressable onPress={handlePress}>
            <GestureDetector gesture={Gesture.Simultaneous(longPressGesture, panGesture, pinchGesture)}>
                <Animated.View>
                    <Svg width={svgSize} height={svgSize} style={{backgroundColor: "#246903", borderRadius: 12}} >
                        <AnimatedG>
                            <Defs>
                                <Pattern
                                    id="greenPattern"
                                    patternUnits="userSpaceOnUse"
                                    width="40"
                                    height="40"
                                    patternTransform={Platform.OS === "android" ? "rotate(45)" : "rotate(0)"}
                                >
                                    <Rect width="40" height="40" fill="#35aa03"/>
                                    <Rect width="20" height="40" fill={Platform.OS === "android" ? "#259704" : "#1f7a04"} opacity={0.4}/>
                                    <Rect width="40" height="20" fill={Platform.OS === "android" ? "#259704" : "#1f7a04"} opacity={0.4}/>
                                </Pattern>
                            </Defs>
                            <Path d={greenPathData} fill="url(#greenPattern)" stroke={"black"} strokeWidth={1.5}/>
                            {selectedHole && computedTapPoints.map((tap, index) => {
                                const nextPoint = computedTapPoints[index + 1] ? computedTapPoints[index + 1] : toSvgPointLatLon(selectedHole.pin) ? toSvgPointLatLon(selectedHole.pin) : null;

                                if (!nextPoint) return null;

                                return (
                                    <Line
                                        key={`line-${index}`}
                                        x1={tap.x}
                                        y1={tap.y}
                                        x2={nextPoint.x}
                                        y2={nextPoint.y}
                                        stroke="#c1bbbb"
                                        strokeWidth={2}
                                    />
                                );
                            })}
                            { userLocation !== null && (
                                <AnimatedG x={toSvgPointLatLon(userLocation).x} y={toSvgPointLatLon(userLocation).y} animatedProps={inverseAnimatedPropsG}>
                                    <AnimatedCircle
                                        fill="#76eeff"
                                        stroke="black"
                                        r={8}
                                    />
                                    <Path scale={0.6} x={-7} y={-7} d="M12 2l6.5 18.5L12 16l-6.5 4.5L12 2z"/>
                                </AnimatedG>
                                    )
                                    }
                                    {selectedHole && (
                                        <AnimatedCircle
                                            cx={toSvgPointLatLon(selectedHole.start).x}
                                            cy={toSvgPointLatLon(selectedHole.start).y}
                                            fill="#ff9800"
                                            stroke="white"
                                            animatedProps={inverseAnimatedProps}
                                        />
                                    )
                                    }
                                    {pinLocations && (
                                        pinLocations.map((pin, index) => {
                                            const p = toSvgPointLatLon(pin);
                                            const isSelectedHolePin = selectedHole && pin.latitude === selectedHole.pin.latitude && pin.longitude === selectedHole.pin.longitude;
                                            return (
                                                <React.Fragment key={"pin-" + index}>
                                                    <Circle
                                                        cx={p.x}
                                                        cy={p.y}
                                                        fill={isSelectedHolePin ? "#ef4343" : "white"}
                                                        stroke={"white"}
                                                        strokeWidth={isSelectedHolePin ? 1 : 0}
                                                        r={6}
                                                    />
                                                    <Path fill={isSelectedHolePin ? "white" : "black"} scale={0.35}
                                                          x={p.x - 4} y={p.y - 4} fillRule="evenodd"
                                                          d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
                                                          clipRule="evenodd"/>
                                                </React.Fragment>
                                            );
                                        })
                                    )}

                                    {taps.map((tap, index) => {
                                        const p = toSvgPointLatLon(tap);

                                        return (
                                            <AnimatedCircle
                                                cx={p.x}
                                                cy={p.y}
                                                r={1}
                                                fill={tap.misreadLine || tap.misreadSlope ? "red" : "white"}
                                                stroke="black"
                                                animatedProps={inverseAnimatedProps}
                                                key={"tap-" + index}
                                            />
                                        );
                                    })}
                                </AnimatedG>
                                </Svg>
                                </Animated.View>
                                </GestureDetector>
                                </Pressable>
                                );
                            };

                            export {PuttingGreenPolygon}