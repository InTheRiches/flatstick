import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useRouter, useLocalSearchParams, useNavigation} from 'expo-router';
import {Image, Pressable, Text, BackHandler, Platform, useColorScheme, TextInput} from 'react-native';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import {SvgClose, SvgWarning} from '@/assets/svg/SvgComponents';
import {View} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import Svg, {Path} from 'react-native-svg';
import {DangerButton} from "@/components/DangerButton";
import ArrowComponent from "@/components/icons/ArrowComponent";
import React from "react";
import {getFirestore, setDoc, doc} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import generatePushID from "@/components/utils/GeneratePushID";
import Loading from "@/components/popups/Loading";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/buttons/PrimaryButton";
import {SecondaryButton} from "@/components/buttons/SecondaryButton";
import {useAppContext} from "@/contexts/AppCtx";
import GreenBreakSelector from '../../../components/utils/GreenBreakSelector';
import TotalPutts from '../../../components/popups/TotalPutts';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import BigMissModal from '../../../components/popups/BigMiss';

const initialState = {
  confirmLeave: false,
  confirmSubmit: false,
  loading: false,
  largeMiss: false,
  largeMissBy: [0, 0],
  width: 0,
  height: 0,
  center: false,
  point: {},
  hole: 1,
  distance: -1,
  puttBreak: [0, 0],
  missRead: false,
  theta: 0,
  putts: [],
}

const breaks = {
  45: "Left to Right",
  90: "Left to Right",
  135: "Left to Right",
  315: "Right to Left",
  270: "Right to Left",
  225: "Right to Left",
  0: "Straight",
  360: "Straight",
  180: "Straight",
}

const slopes = {
  45: "Downhill",
  90: "Neutral",
  135: "Uphill",
  315: "Downhill",
  270: "Neutral",
  225: "Uphill",
  0: "Downhill",
  360: "Downhill",
  180: "Uphill",
}

const breakConversion = [
  "Left to Right",
  "Right to Left",
  "Straight",
]

const slopeConversion = [
  "Downhill",
  "Neutral",
  "Uphill"
]

const convertThetaToBreak = (theta) => {
  return [breakConversion.indexOf(breaks[theta]), slopeConversion.indexOf(slopes[theta])];
}

// TODO WHEN SWITCHING TO THE NEXT HOLE, ADD A POPUP ASKING HOW MANY PUTTS IT TOOK TO FINISH OUT THE HOLE
export default function Simulation() {
  const colors = useColors();
  const navigation = useNavigation();
  const {updateStats} = useAppContext();

  const db = getFirestore();
  const auth = getAuth();
  const router = useRouter();

  const {stringHoles} = useLocalSearchParams();
  const holes = parseInt(stringHoles);
  const totalPuttsRef = useRef(null);
  const bigMissRef = useRef(null);

  const [{
    loading,
    confirmLeave,
    largeMiss,
    largeMissBy,
    confirmSubmit,
    width,
    height,
    center,
    point,
    hole,
    theta,
    distance,
    missRead,
    putts,
    bigMissDistance,
    bigMissPutts
  },
    setState
  ] = useState(initialState);

  const updateField = (field, value) => {
    setState(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (confirmLeave === true && largeMiss) {
      updateField("largeMissBy", [0, 0]);
      updateField("largeMiss", false);
    }
  }, [confirmLeave])

  useEffect(() => {
    const onBackPress = () => {
      updateField("confirmLeave", true);

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, []);

  const normalizeVector = (vector) => {
    const length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
    return [vector[0] / length, vector[1] / length];
  };

  const getLargeMissPoint = (largeMissBy, largeMissDistance) => {
    const [dirX, dirY] = normalizeVector(largeMissBy);
    const missedX = dirX * largeMissDistance;
    const missedY = dirY * largeMissDistance;
    return {x: missedX, y: missedY};
  };

  const pushHole = (totalPutts, largeMissDistance) => {
    let distanceMissedFeet = 0;

    if (largeMiss) {
      bigMissRef.current.dismiss();
    } else {
      // find the distance to center of the point in x and y
      const distanceX = width / 2 - point.x;
      const distanceY = height / 2 - point.y;
      const distanceMissed = center ? 0 : Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

      const conversionFactor = 5 / width;
      distanceMissedFeet = distanceMissed * conversionFactor;
    }

    const puttsCopy = [...putts];
    puttsCopy[hole - 1] = {
      distance: distance,
      theta: theta,
      missRead: missRead,
      largeMiss: largeMiss,
      totalPutts: totalPutts,
      distanceMissed: largeMiss ? largeMissDistance : distanceMissedFeet, // TODO ADD A SLIDER FOR ESTIMATED LARGE MISS
      point: largeMiss ? getLargeMissPoint(largeMissBy, largeMissDistance) : point
    };

    updateField("putts", puttsCopy);
    return puttsCopy;
  }

  const nextHole = (totalPutts, largeMissDistance = -1) => {
    if (hole === holes) {
      updateField("confirmSubmit", true);
      return;
    }
    if (!largeMiss && point.x === undefined)
      return;

    const puttsCopy = pushHole(totalPutts, largeMissDistance);

    // generate new data
    if (putts[hole] === undefined) {
      updateField("point", {});
      updateField("missRead", false);
      updateField("center", false);
      updateField("largeMissBy", [0, 0]);
      updateField("theta", 0);
      updateField("puttBreak", convertThetaToBreak(0));
      updateField("distance", -1);
      updateField("hole", hole + 1);
      updateField("largeMiss", false);
      return;
    }

    // load old data (as the person went back before now going forward)
    const nextPutt = puttsCopy[hole];
    if (nextPutt.largeMiss) {
      updateField("point", {});
      updateField("largeMiss", true);
      updateField("largeMissBy", [nextPutt.point.x, nextPutt.point.y])
    } else {
      updateField("point", nextPutt.point);
      updateField("largeMissBy", [0, 0]);
    }
    updateField("missRead", nextPutt.missRead);
    updateField("center", nextPutt.distanceMissed === 0);

    updateField("theta", nextPutt.theta);
    updateField("hole", hole + 1);
    updateField("distance", nextPutt.distance);
    updateField("largeMiss", false);
  }

  // IF THE LAST HOLE HAD A BIG MISS, OPEN THE BIG MISS MENU
  const lastHole = () => {
    if (hole === 1)
      return

    const puttsCopy = pushHole(-1, 0);

    const lastPutt = puttsCopy[hole - 2];
    console.log("last: " + lastPutt.largeMiss);
    if (lastPutt.largeMiss) {
      updateField("point", {});
      updateField("largeMiss", true);
      updateField("largeMissBy", [lastPutt.point.x, lastPutt.point.y])
    } else {
      updateField("point", lastPutt.point);
      updateField("largeMiss", false);
      updateField("largeMissBy", [0, 0]);
    }
    updateField("missRead", lastPutt.missRead);
    updateField("center", lastPutt.distanceMissed === 0);

    updateField("theta", lastPutt.theta);
    updateField("hole", hole - 1);
    updateField("distance", lastPutt.distance);
  }

  const onLayout = (event) => {
    const {width, height} = event.nativeEvent.layout;

    updateField("width", width);
    updateField("height", height);
  };

  const singleTap = Gesture.Tap()
    .onStart((data) => {
      runOnJS(updateField)("center", data.x > width / 2 - 25 && data.x < width / 2 + 25 && data.y > height / 2 - 25 && data.y < height / 2 + 25);

      const boxWidth = width / 10;
      const boxHeight = height / 10;

      // Assuming tap data comes in as `data.x` and `data.y`
      const snappedX = Math.round(data.x / boxWidth) * boxWidth;
      const snappedY = Math.round(data.y / boxHeight) * boxHeight;

      runOnJS(updateField)("point", {x: snappedX, y: snappedY});
    });

  const fullReset = () => {
    navigation.goBack();
  }

  const roundTo = (num, decimalPlaces) => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  };

  const submit = (partial = false) => {
    const puttsCopy = [...putts];

    if (point.x !== undefined) {
      let distanceMissedFeet = 0;

      if (!largeMiss) {
        // find the distance to center of the point in x and y
        const distanceX = width / 2 - point.x;
        const distanceY = height / 2 - point.y;
        const distanceMissed = center ? 0 : Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

        const conversionFactor = 5 / width;
        distanceMissedFeet = distanceMissed * conversionFactor;
      }

      puttsCopy[hole - 1] = {
        distance: distance,
        theta: theta,
        missRead: missRead,
        largeMiss: largeMiss,
        distanceMissed: distanceMissedFeet, // TODO ADD A SLIDER FOR ESTIMATED LARGE MISS
        point: largeMiss ? {x: 0, y: 0} : point
      };
      updateField("putts", puttsCopy);
    }

    const trimmedPutts = [];

    let totalPutts = 0;
    let avgMiss = 0;
    let madePercent = 0;

    puttsCopy.forEach((putt, index) => {
      if (putt !== undefined && distance !== -1) {
        if (putt.totalPutts === -1) {
          if (putt.largeMiss) {
            totalPutts += 3; // TODO CAN WE MAKE THIS MORE ACCURATE?
          } else if (putt.distanceMissed === 0) {
            totalPutts++;
            madePercent++;
          } else {
            totalPutts += 2;
          }
        } else totalPutts += putt.totalPutts;

        // TODO this doesnt account for the large miss, update that
        if (putt.distanceMissed !== 0) {
          avgMiss += putt.distanceMissed;
          if (index != 0) {
            avgMiss /= 2;
          }
        }

        trimmedPutts.push({
          distance: putt.distance,
          xDistance: roundTo(-1 * (width / 2 - putt.point.x) * (5 / width), 2),
          yDistance: roundTo((height / 2 - putt.point.y) * (5 / height), 2),
          puttBreak: convertThetaToBreak(putt.theta),
          missRead: putt.missRead,
          distanceMissed: putt.distanceMissed,
          largeMiss: putt.largeMiss,
          totalPutts: putt.totalPutts
        });
      }
    });
    avgMiss = roundTo(avgMiss, 1);
    madePercent /= puttsCopy.length;

    updateField("loading", true)
    // Add a new document in collection "cities"
    setDoc(doc(db, `users/${auth.currentUser.uid}/sessions`, generatePushID()), {
      date: new Date().toISOString(),
      timestamp: new Date().getTime(),
      holes: partial ? puttsCopy.length : holes,
      putts: trimmedPutts,
      totalPutts: totalPutts,
      avgMiss: avgMiss,
      madePercent: madePercent,
      type: "real-simulation"
    }).then(() => {
      updateStats().then(() => {
        router.push({
          pathname: `/`,
        });
      }).catch((error) => {
        console.log("updateStats " + error);
      });
    }).catch((error) => {
      console.log("setDocs " + error);
    });
  }

  return (loading ? <Loading/> :
      <BottomSheetModalProvider>
        <ThemedView style={{flexGrow: 1}}>
          <View style={{
            width: "100%",
            flexGrow: 1,
            paddingHorizontal: Platform.OS === "ios" ? 32 : 24,
            flexDirection: "column",
            justifyContent: "space-between",
            marginBottom: 20
          }}>
            <View>
              <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <ThemedText style={{marginBottom: 6}} type="title">Hole {hole}<Text
                  style={{fontSize: 14}}>/{holes}</Text></ThemedText>
                <Pressable onPress={() => updateField("confirmLeave", true)}>
                  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                       strokeWidth={1.5}
                       stroke={colors.text.primary} width={32} height={32}>
                    <Path strokeLinecap="round" strokeLinejoin="round"
                          d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"/>
                  </Svg>
                </Pressable>
              </View>
              <GreenVisual slope={slopes[theta]} puttBreak={breaks[theta]} theta={theta}
                           setTheta={(newTheta) => updateField("theta", newTheta)} distance={distance}
                           updateField={updateField}/>
            </View>
            <View>
              <Pressable onPress={() => updateField("missRead", !missRead)} style={{
                marginTop: 12,
                marginBottom: 4,
                paddingRight: 20,
                paddingLeft: 10,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: missRead ? colors.button.danger.background : colors.button.danger.disabled.background,
                alignSelf: "center",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: 'center',
              }}>
                {missRead ?
                  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                       width={20}
                       height={20} stroke={colors.button.danger.text}>
                    <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                  </Svg> :
                  <SvgClose width={20} height={20} stroke={colors.button.danger.text}></SvgClose>
                }
                <Text style={{color: 'white', marginLeft: 8}}>Misread</Text>
              </Pressable>
              <View style={{
                alignSelf: "center",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%"
              }}>
                <ThemedText></ThemedText>
                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>2
                  ft</ThemedText>
                <ThemedText></ThemedText>
                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>1
                  ft</ThemedText>
                <ThemedText></ThemedText>
                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>0
                  ft</ThemedText>
                <ThemedText></ThemedText>
                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>1
                  ft</ThemedText>
                <ThemedText></ThemedText>
                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>2
                  ft</ThemedText>
                <ThemedText></ThemedText>
              </View>
              <GestureDetector gesture={singleTap}>
                <View onLayout={onLayout}
                      style={{
                        alignSelf: "center",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%"
                      }}>
                  <Image
                    source={require('@/assets/images/putting-grid.png')}
                    style={{
                      borderWidth: 1,
                      borderRadius: 12,
                      borderColor: colors.putting.grid.border,
                      width: "100%",
                      aspectRatio: "1",
                      height: undefined
                    }}/>
                  <View style={{
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    left: width / 2 - (width / 20),
                    top: height / 2 - (width / 20),
                    width: width / 10 + 1,
                    height: width / 10 + 1,
                    borderRadius: 24,
                    backgroundColor: center ? colors.checkmark.background : colors.checkmark.bare.background
                  }}>
                    <Svg width={24} height={24}
                         stroke={center ? colors.checkmark.color : colors.checkmark.bare.color}
                         xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" strokeWidth="3">
                      <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                    </Svg>
                  </View>
                  {point.x !== undefined && center !== true ? (
                    <Image source={require('@/assets/images/golf-ball.png')} style={{
                      position: "absolute",
                      left: point.x - 12,
                      top: point.y - 12,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#fff"
                    }}></Image>
                  ) : null}
                </View>
              </GestureDetector>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 14, gap: 4}}>
              <PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}} title="Back"
                             disabled={hole === 1} onPress={() => lastHole()}></PrimaryButton>
              <DangerButton onPress={() => {
                if (distance === -1) return;
                updateField("largeMiss", true);
                bigMissRef.current.present();
              }}
                            title={"Miss > 5ft?"}></DangerButton>
              {<PrimaryButton style={{borderRadius: 8, paddingVertical: 9, flex: 1, maxWidth: 96}}
                              title={hole === holes ? "Submit" : "Next"}
                              disabled={point.x === undefined || distance === -1}
                              onPress={() => {
                                if (point.x === undefined || distance === -1) return;
                                else if (center) nextHole(1);
                                else totalPuttsRef.current.present()
                              }}></PrimaryButton>}
            </View>
          </View>
          <TotalPutts totalPuttsRef={totalPuttsRef} nextHole={nextHole}/>
          <BigMissModal updateField={updateField} hole={hole} bigMissRef={bigMissRef} allPutts={putts}
                        rawLargeMissBy={largeMissBy} nextHole={nextHole}/>
          {(confirmLeave || confirmSubmit) &&
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 20,
              height: '100%',
              width: '100%',
              backgroundColor: colors.background.tinted
            }}>
              {confirmLeave &&
                <ConfirmExit cancel={() => updateField("confirmLeave", false)}
                             partial={() => submit(true)}
                             end={fullReset}></ConfirmExit>}
              {confirmSubmit &&
                <ConfirmSubmit cancel={() => updateField("confirmSubmit", false)}
                               submit={submit}></ConfirmSubmit>}
            </View>}
        </ThemedView>
      </BottomSheetModalProvider>
  );
}

// TODO MAKE THIS UPLOAD A PARTIAL ROUND
function ConfirmExit({end, partial, cancel}) {
  const colors = useColors();
  const colorScheme = useColorScheme();

  return (
    <View style={{
      borderColor: colors.border.popup,
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      width: "auto",
      maxWidth: "70%",
      maxHeight: "70%",
      borderRadius: 16,
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 20,
      flexDirection: "col",
    }}>
      <View style={{
        alignSelf: "center",
        padding: 12,
        alignContent: "center",
        flexDirection: "row",
        justifyContent: "center",
        borderRadius: 50,
        backgroundColor: colors.button.danger.background
      }}>
        <SvgWarning width={26} height={26}
                    stroke={colors.button.danger.text}></SvgWarning>
      </View>
      <ThemedText type={"header"} style={{fontWeight: 500, textAlign: "center", marginTop: 14}}>End
        Session</ThemedText>
      <ThemedText type={"default"} secondary={true} style={{textAlign: "center", lineHeight: 18, marginTop: 10}}>Are
        you
        sure you want to end this session? You can always upload the partial round, otherwise all data will be
        lost.
        This action cannot be undone.</ThemedText>
      <Pressable onPress={end} style={({pressed}) => [{
        backgroundColor: pressed ? colors.button.danger.depressed : colors.button.danger.background,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 16
      }]}>
        <Text style={{textAlign: "center", color: colors.button.danger.text, fontWeight: 500}}>End
          Session</Text>
      </Pressable>
      {colorScheme === "light" ?
        [
          <PrimaryButton key={"secondary"} onPress={partial} title={"Upload as Partial"}
                         style={{marginTop: 10, paddingVertical: 10, borderRadius: 10}}></PrimaryButton>,
          <PrimaryButton key={"primary"} onPress={cancel} title={"Cancel"}
                         style={{marginTop: 10, paddingVertical: 10, borderRadius: 10}}></PrimaryButton>
        ]
        :
        [
          <SecondaryButton key={"secondary"} onPress={partial} title={"Upload as Partial"}
                           style={{marginTop: 10, paddingVertical: 10, borderRadius: 10}}></SecondaryButton>,
          <SecondaryButton key={"primary"} onPress={cancel} title={"Cancel"}
                           style={{marginTop: 10, paddingVertical: 10, borderRadius: 10}}></SecondaryButton>
        ]
      }
    </View>
  )
}

function ConfirmSubmit({submit, cancel}) {
  const colors = useColors();

  const colorScheme = useColorScheme();

  return (
    <ThemedView style={{
      borderColor: colors.border.popup,
      borderWidth: 1,
      width: "auto",
      maxWidth: "70%",
      maxHeight: "70%",
      borderRadius: 16,
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 20,
      flexDirection: "col"
    }}>
      <View style={{justifyContent: "center", flexDirection: "row", width: "100%"}}>
        <View style={{
          padding: 12,
          alignContent: "center",
          flexDirection: "row",
          justifyContent: "center",
          borderRadius: 50,
          backgroundColor: colors.checkmark.background
        }}>
          <Svg width={24} height={24} stroke={colors.checkmark.color} xmlns="http://www.w3.org/2000/svg"
               fill="none"
               viewBox="0 0 24 24" strokeWidth="3">
            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
          </Svg>
        </View>
      </View>
      <ThemedText type={"header"} style={{fontWeight: 500, textAlign: "center", marginTop: 14}}>Submit
        Session</ThemedText>
      <ThemedText type={"default"} secondary={true} style={{textAlign: "center", lineHeight: 18, marginTop: 8}}>Done
        putting? Submit to find out if you should celebrate—or blame the slope, the wind, and your
        shoes.</ThemedText>
      {colorScheme === "light" ?
        [
          <SecondaryButton key={"primary"} onPress={submit} title={"Submit"}
                           style={{paddingVertical: 10, borderRadius: 10, marginTop: 32}}></SecondaryButton>,
          <PrimaryButton key={"secondary"} onPress={cancel} title={"Cancel"}
                         style={{paddingVertical: 10, borderRadius: 10, marginTop: 10}}></PrimaryButton>
        ]
        :
        [
          <PrimaryButton key={"secondary"} onPress={submit} title={"Submit"}
                         style={{paddingVertical: 10, borderRadius: 10, marginTop: 32}}></PrimaryButton>,
          <SecondaryButton key={"primary"} onPress={cancel} title={"Cancel"}
                           style={{paddingVertical: 10, borderRadius: 10, marginTop: 10}}></SecondaryButton>
        ]
      }
    </ThemedView>
  )
}

// TODO this doesnt bring up the total putts modal
function BigMiss({largeMissBy, updateField, nextHole, totalPuttsRef}) {
  const colors = useColors();

  const isEqual = (arr, arr2) =>
    Array.isArray(arr) && arr.length === arr2.length && arr.every((val, index) => val === arr2[index]);

  const close = () => {
    updateField("largeMissBy", [0, 0]);
    updateField("largeMiss", false);
  }

  return (
    <View style={{
      borderColor: colors.border.popup,
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      width: "auto",
      maxWidth: "70%",
      maxHeight: "70%",
      borderRadius: 16,
      paddingTop: 18,
      paddingBottom: 16,
      paddingHorizontal: 16,
      flexDirection: "col",
      alignItems: "center",
    }}>
      <View style={{position: "absolute", right: 16, top: 16}}>
        <SecondaryButton onPress={() => updateField("largeMiss", false)}
                         style={{padding: 3, borderRadius: 8}}>
          <SvgClose stroke={colors.button.secondary.text} width={24} height={24}></SvgClose>
        </SecondaryButton>
      </View>
      <View style={{
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
      }}>
        <View style={{
          height: 48,
          aspectRatio: 1,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          borderRadius: 50,
          backgroundColor: colors.button.danger.background
        }}>
          <Text style={{color: "white", fontWeight: 600, fontSize: 24}}>!</Text>
        </View>
        <View style={{marginTop: 12}}>
          <ThemedText type={"header"} style={{fontWeight: 500, textAlign: "center"}}>Miss &gt;3ft</ThemedText>
          <ThemedText type={"default"} secondary={true}
                      style={{textAlign: "center", lineHeight: 18, marginTop: 10}}>Putting
            for the rough, are we? You might need GPS for the next one.</ThemedText>
        </View>
      </View>
      <View style={{flexDirection: "row", gap: 12, alignSelf: "center"}}>
        <View style={{flexDirection: "column", gap: 12}}>
          <Pressable onPress={() => updateField("largeMissBy", [1, 1])} style={{
            aspectRatio: 1,
            padding: 20,
            backgroundColor: isEqual(largeMissBy, [1, 1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 50
          }}>
            <ArrowComponent horizontalBreak={1} verticalSlope={0}
                            selected={isEqual(largeMissBy, [1, 1])}></ArrowComponent>
          </Pressable>
          <Pressable onPress={() => updateField("largeMissBy", [1, 0])} style={{
            aspectRatio: 1,
            padding: 20,
            backgroundColor: isEqual(largeMissBy, [1, 0]) ? colors.button.danger.background : colors.button.danger.disabled.background,
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 50
          }}>
            <ArrowComponent horizontalBreak={1} verticalSlope={1}
                            selected={isEqual(largeMissBy, [1, 0])}></ArrowComponent>
          </Pressable>
          <Pressable onPress={() => updateField("largeMissBy", [1, -1])} style={{
            aspectRatio: 1,
            padding: 20,
            backgroundColor: isEqual(largeMissBy, [1, -1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 50
          }}>
            <ArrowComponent horizontalBreak={1} verticalSlope={2}
                            selected={isEqual(largeMissBy, [1, -1])}></ArrowComponent>
          </Pressable>
        </View>
        <View style={{flexDirection: "column", justifyContent: "space-between"}}>
          <Pressable onPress={() => updateField("largeMissBy", [0, 1])} style={{
            aspectRatio: 1,
            padding: 20,
            backgroundColor: isEqual(largeMissBy, [0, 1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 50
          }}>
            <ArrowComponent horizontalBreak={2} verticalSlope={0}
                            selected={isEqual(largeMissBy, [0, 1])}></ArrowComponent>
          </Pressable>
          <Pressable onPress={() => updateField("largeMissBy", [0, -1])} style={{
            aspectRatio: 1,
            padding: 20,
            backgroundColor: isEqual(largeMissBy, [0, -1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 50
          }}>
            <ArrowComponent horizontalBreak={2} verticalSlope={2}
                            selected={isEqual(largeMissBy, [0, -1])}></ArrowComponent>
          </Pressable>
        </View>
        <View style={{flexDirection: "column", gap: 12}}>
          <Pressable onPress={() => updateField("largeMissBy", [-1, 1])} style={{
            aspectRatio: 1,
            padding: 20,
            backgroundColor: isEqual(largeMissBy, [-1, 1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 50
          }}>
            <ArrowComponent horizontalBreak={0} verticalSlope={0}
                            selected={isEqual(largeMissBy, [-1, 1])}></ArrowComponent>
          </Pressable>
          <Pressable onPress={() => updateField("largeMissBy", [-1, 0])} style={{
            aspectRatio: 1,
            padding: 20,
            backgroundColor: isEqual(largeMissBy, [-1, 0]) ? colors.button.danger.background : colors.button.danger.disabled.background,
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 50
          }}>
            <ArrowComponent horizontalBreak={0} verticalSlope={1}
                            selected={isEqual(largeMissBy, [-1, 0])}></ArrowComponent>
          </Pressable>
          <Pressable onPress={() => updateField("largeMissBy", [-1, -1])} style={{
            aspectRatio: 1,
            padding: 20,
            backgroundColor: isEqual(largeMissBy, [-1, -1]) ? colors.button.danger.background : colors.button.danger.disabled.background,
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 50
          }}>
            <ArrowComponent horizontalBreak={0} verticalSlope={2}
                            selected={isEqual(largeMissBy, [-1, -1])}></ArrowComponent>
          </Pressable>
        </View>
      </View>
      <Pressable onPress={() => {
        if (!isEqual(largeMissBy, [0, 0])) {
          totalPuttsRef.current.present();
        }
      }} style={{
        backgroundColor: isEqual(largeMissBy, [0, 0]) ? colors.button.disabled.background : colors.button.danger.background,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 28,
        borderWidth: 1,
        borderColor: isEqual(largeMissBy, [0, 0]) ? colors.button.disabled.border : "transparent",
        paddingHorizontal: 64
      }}>
        <Text style={{
          textAlign: "center",
          color: isEqual(largeMissBy, [0, 0]) ? colors.button.disabled.text : colors.button.danger.text,
          fontWeight: 500
        }}>Submit</Text>
      </Pressable>
    </View>
  )
}

function GreenVisual({theta, setTheta, updateField, distance, slope, puttBreak}) {
  const colors = useColors();

  return (
    <View style={{
      backgroundColor: colors.background.secondary,
      flexDirection: "row",
      borderRadius: 16,
      elevation: 4,
      overflow: "hidden",
      gap: 8
    }}>
      <View style={{flex: 1, padding: 8, paddingRight: 0}}>
        <GreenBreakSelector theta={theta} setTheta={setTheta}/>
      </View>
      <View style={{flex: 0.9, flexDirection: "column", borderLeftWidth: 1, borderColor: colors.border.default}}>
        <View style={{
          flexDirection: "column",
          borderBottomWidth: 1,
          borderColor: colors.border.default,
          paddingLeft: 8,
          flex: 1,
          justifyContent: "center"
        }}>
          <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Break</Text>
          <Text style={{
            fontSize: 20,
            textAlign: "left",
            color: colors.text.primary,
            fontWeight: "bold"
          }}>{puttBreak}</Text>
        </View>
        <View style={{
          flexDirection: "column",
          borderBottomWidth: 1,
          borderColor: colors.border.default,
          paddingLeft: 8,
          flex: 1,
          justifyContent: "center"
        }}>
          <Text style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Slope</Text>
          <Text style={{
            fontSize: 20,
            textAlign: "left",
            color: colors.text.primary,
            fontWeight: "bold"
          }}>{slope}</Text>
        </View>
        <View style={{
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
          alignSelf: "center",
          flex: 1,
          paddingHorizontal: 12
        }}>
          <PrimaryButton style={{
            aspectRatio: 1,
            paddingHorizontal: 4,
            paddingVertical: 4,
            borderRadius: 16,
            flex: 0
          }} onPress={() => {
            if (distance === -1) updateField("distance", 99);
            else if (distance === 1) updateField("distance", 99);
            else updateField("distance", distance - 1);
          }}>
            <Svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke={colors.button.primary.text}
              width={18}
              height={18}
            >
              <Path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
            </Svg>
          </PrimaryButton>
          <View style={{
            alignSelf: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            borderWidth: 1,
            borderColor: colors.border.default,
            borderRadius: 8,
            flex: 1,
          }}>
            <TextInput style={{ flex: 1, fontSize: 20, fontWeight: "bold"}} placeholder="?" textAlign='center' value={distance}/>
            <View style={{backgroundColor: colors.background.primary, flex: 1}}>
              <Text style={{
                fontSize: 20,
                paddingVertical: 2,
                fontWeight: "bold",
                textAlign: "center",
                color: colors.text.primary,
              }}>ft</Text>
            </View>
          </View>
          <PrimaryButton
            style={{
              aspectRatio: 1,
              paddingHorizontal: 4,
              paddingVertical: 4,
              borderRadius: 16,
              flex: 0
            }}
            onPress={() => {
              if (distance === -1) updateField("distance", 1);
              else if (distance === 99) updateField("distance", 1);
              else updateField("distance", distance + 1);
            }}>
            <Svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke={colors.button.primary.text}
              width={18}
              height={18}
            >
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </Svg>
          </PrimaryButton>
        </View>
      </View>
    </View>
  )
}