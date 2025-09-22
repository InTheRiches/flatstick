import {Dimensions, Platform, View} from "react-native";
import {isPointInPolygon} from "@/utils/courses/polygonUtils";
import {clampLineToBounds} from "@/utils/courses/boundsUtils";
import * as d3 from "d3-shape";
import {Circle, Defs, G, Line, Path, Pattern, Rect} from "react-native-svg";
import React, {useEffect, useMemo, useState} from "react";
import SvgPanZoom, {SvgPanZoomElement} from "react-native-svg-pan-zoom";

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
    const [showMisread, setShowMisread] = useState(-1);

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
        () => taps.map((tap) => toSvgPointLatLon(tap)),
        [taps, bounds]
    );

    // Helper to convert any LatLon to an SVG point using the provided bounds
    const toSvgPoint = (coord) => {
        const x = (((coord.x) - bounds.minLon) / bounds.range) * svgSize;
        const y = ((bounds.maxLat - (coord.y)) / bounds.range) * svgSize; // Y is inverted
        return {x, y};
    };

    const handlePress = (x, y) => {
        if (holedOut) {
            setHoledOut(false);
            return; // don't allow taps if holed out
        }
        // --- Convert to Lat/Lon ---
        const lon = (x / svgSize) * bounds.range + bounds.minLon;
        const lat = bounds.maxLat - (y / svgSize) * bounds.range;

        if (!isPointInPolygon({ latitude: lat, longitude: lon }, greenCoords)) {
            console.warn("Tapped point is outside the green polygon.");
            return;
        }

        // // check to see if there is already a pin or tap within 5 pixels, if so, remove the putt
        // const tapThreshold = 10; // pixels
        // for (const tap of taps) {
        //     const tapPoint = toSvgPointLatLon(tap);
        //     const dx = tapPoint.x - x;
        //     const dy = tapPoint.y - y;
        //     if (Math.sqrt(dx * dx + dy * dy) < tapThreshold) {
        //         setTaps(taps.filter(t => t.latitude !== tap.latitude || t.longitude !== tap.longitude));
        //         return;
        //     }
        // }

        onTap({ latitude: lat, longitude: lon });
        // // delay 0 ms to ensure tap is added before opening misread
        // setTimeout(() => {
        //     scale.value = scale.value+0.001; // trigger re-calculation of inverseAnimatedProps
        // }, 100);
    };

    if (!greenCoords) {
        return <View></View>
    }

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
            <View style={{width: svgSize, height: svgSize, overflow: "hidden", borderRadius: 12, backgroundColor: "#246903"}}>
                <SvgPanZoom onClick={() => console.log("clicked")} initialZoom={1} minScale={1.2} maxScale={4} canvasWidth={svgSize} canvasHeight={svgSize} canvasStyle={{backgroundColor: "#246903"}}>
                    <G>
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
                            <Pattern
                                id="fairwayPattern"
                                patternUnits="userSpaceOnUse"
                                width="60"
                                height="40"
                                patternTransform={Platform.OS === "android" ? "rotate(-45)" : "rotate(0)"}
                            >
                                <Rect width="60" height="40" fill={Platform.OS === "android" ? "#43ac0a" : "#429a06"}/>
                                <Rect width="30" height="40" fill={Platform.OS === "android" ? "#2a9100" : "#0b7200"} opacity={0.4}/>
                            </Pattern>
                        </Defs>
                        {fairwayPoints.map((fairway, index) => {
                            return <Path key={"fairway-" + index} d={lineGenerator(fairway)} fill="url(#fairwayPattern)"/>
                        })}
                        <SvgPanZoomElement onClick={(event) => handlePress(event.nativeEvent.touches[0].locationX, event.nativeEvent.touches[0].locationY)}>
                            <Path d={greenPathData} fill="url(#greenPattern)" stroke={"black"} strokeWidth={1.5}/>
                        </SvgPanZoomElement>
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
                                fill="#76eeff"
                                stroke="black"
                                r={4}
                            />
                        )
                        }

                        {taps.map((tap, index) => {
                            const p = toSvgPointLatLon(tap);

                            return (
                                <SvgPanZoomElement key={"tap-" + index} onClick={() => setTaps(taps.filter((t, i) => i !== index))}>
                                    <Circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={4}
                                        fill={tap.misreadLine || tap.misreadSlope ? "red" : "white"}
                                        stroke="black"
                                    />
                                </SvgPanZoomElement>
                            );
                        })}
                        {pinLocation && (
                            <G>
                                <Circle
                                    fill="gold"
                                    stroke="black"
                                    r={4}
                                    cx={toSvgPointLatLon(pinLocation).x}
                                    cy={toSvgPointLatLon(pinLocation).y}
                                />
                                <Path fill={"black"} scale={0.25}
                                      x={toSvgPointLatLon(pinLocation).x-3} y={toSvgPointLatLon(pinLocation).y-3} fillRule="evenodd"
                                      d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054A8.25 8.25 0 0 0 18 4.524l3.11-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
                                      clipRule="evenodd"/>
                            </G>
                        )}
                    </G>
                </SvgPanZoom>
            </View>
    );
};

export {GreenPolygon}