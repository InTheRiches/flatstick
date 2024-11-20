import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {ThemedButton} from '@/components/ThemedButton';
import {useRouter, useLocalSearchParams, useNavigation} from 'expo-router';
import {Image, Pressable, Text, BackHandler} from 'react-native';
import {GestureDetector, Gesture, TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import {SvgClose, SvgWarning} from '../../assets/svg/SvgComponents';
import {View} from 'react-native';
import {useEffect, useState} from 'react';
import Svg, {Path} from 'react-native-svg';
import {DangerButton} from "../../components/DangerButton";
import ArrowComponent from "../../components/icons/ArrowComponent";
import React from "react";
import {getFirestore, setDoc, doc, runTransaction} from "firebase/firestore";
import {getAuth} from "firebase/auth";
import generatePushID from "../../components/utils/GeneratePushID";
import Loading from "../../components/popups/Loading";
import useColors from "../../hooks/useColors";
import {PrimaryButton} from "../../components/buttons/PrimaryButton";
import {SecondaryButton} from "../../components/buttons/SecondaryButton";

// TODO add an extreme mode with like left right left breaks, as well as extremem vs slight breaks
// AND THEY GO BACK, NOT SHOW BOTH DIALOGES ON TOP OF EACH OTHER, AND TO CANCEL THE OTHER ONE BENEATH IT
const breaks = [
  "Left to Right",
  "Right to Left",
  "Neutral",
]

const slopes = [
  "Downhill",
  "Neutral",
  "Uphill"
]

const greenMaps = {
  "0,0": require("@/assets/images/greens/rightForward.png"),
  "0,1": require("@/assets/images/greens/right.png"),
  "0,2": require("@/assets/images/greens/backRight.png"),
  "1,0": require("@/assets/images/greens/leftForward.png"),
  "1,1": require("@/assets/images/greens/left.png"),
  "1,2": require("@/assets/images/greens/backLeft.png"),
  "2,0": require("@/assets/images/greens/forward.png"),
  "2,1": require("@/assets/images/greens/neutral.png"),
  "2,2": require("@/assets/images/greens/back.png"),
}

function generateBreak() {
  // Generate a random break
  return [Math.floor(Math.random() * breaks.length), Math.floor(Math.random() * slopes.length)];
}

function generateDistance(difficulty) {
  // Generate a random distance
  return Math.floor(Math.random() * (difficulty === "Easy" ? 6 : difficulty === "Medium" ? 12 : 20)) + 3;
}

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
  distance: 0,
  puttBreak: generateBreak(),
  missRead: false,
  putts: []
}

// TODO WHEN SWITCHING TO THE NEXT HOLE, ADD A POPUP ASKING HOW MANY PUTTS IT TOOK TO FINISH OUT THE HOLE
export default function Simulation() {
  const colors = useColors();
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();
  const router = useRouter();

  const {localHoles, difficulty, mode} = useLocalSearchParams();
  const holes = parseInt(localHoles);

  const [
    {
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
      puttBreak,
      distance,
      missRead,
      putts
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
    updateField("distance", generateDistance(difficulty));
  }, []);

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

  const nextHole = () => {
    if (hole === holes || (!largeMiss && point.x === undefined))
      return;

    let distanceMissedFeet = 0;

    if (largeMiss) {
      console.log("hello")
      // find the distance to center of the point in x and y
      const distanceX = largeMissBy[0] * 8;
      const distanceY = largeMissBy[1] * 8;
      distanceMissedFeet = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
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
      break: puttBreak,
      missRead: missRead,
      distanceMissed: distanceMissedFeet,
      point: largeMiss ? {x: largeMissBy[0], y: largeMissBy[1]} : point
    };
    updateField("putts", puttsCopy);

    // generate new data
    if (putts[hole] === undefined) {
      updateField("point", {});
      updateField("missRead", false);
      updateField("center", false);
      updateField("largeMissBy", [0, 0]);

      updateField("puttBreak", generateBreak());
      updateField("distance", generateDistance(difficulty));
      updateField("hole", hole + 1);
      updateField("largeMiss", false);
      return;
    }

    // load old data (as the person went back before now going forward)
    const nextPutt = puttsCopy[hole];
    if (nextPutt.distanceMissed > 7.15) {
      updateField("point", {});
      updateField("largeMiss", true);
      updateField("largeMissBy", [nextPutt.point.x, nextPutt.point.y])
    } else {
      updateField("point", nextPutt.point);
      updateField("largeMissBy", [0, 0]);
    }
    updateField("missRead", nextPutt.missRead);
    updateField("center", nextPutt.distanceMissed === 0);

    updateField("puttBreak", nextPutt.break);
    updateField("hole", hole + 1);
    updateField("distance", nextPutt.distance);
    updateField("largeMiss", false);
  }

  // IF THE LAST HOLE HAD A BIG MISS, OPEN THE BIG MISS MENU
  const lastHole = () => {
    if (hole === 1)
      return

    let distanceMissedFeet = 0;

    if (largeMiss) {
      // find the distance to center of the point in x and y
      const distanceX = largeMissBy[0] * 8;
      const distanceY = largeMissBy[1] * 8;
      distanceMissedFeet = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
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
      break: puttBreak,
      missRead: missRead,
      distanceMissed: distanceMissedFeet,
      point: largeMiss ? {x: largeMissBy[0], y: largeMissBy[1]} : point
    };
    updateField("putts", puttsCopy);

    const lastPutt = puttsCopy[hole - 2];
    if (lastPutt.distanceMissed > 7.15) {
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

    updateField("puttBreak", lastPutt.break);
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

  const submit = () => {
    const distanceX = width / 2 - point.x;
    const distanceY = height / 2 - point.y;
    const distanceMissed = center ? 0 : Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

    const conversionFactor = 5 / width;
    const distanceMissedFeet = distanceMissed * conversionFactor;

    const puttsCopy = [...putts];
    puttsCopy[hole - 1] = {
      distance: distance,
      break: puttBreak,
      missRead: missRead,
      distanceMissed: distanceMissedFeet,
      point: point
    };

    updateField("putts", puttsCopy);

    const trimmedPutts = [];

    let totalPutts = 0;

    puttsCopy.forEach((putt) => {
      if (putt !== undefined) {
        if (putt.distanceMissed === 0) totalPutts++;
        else {
          totalPutts += 2; // TODO THIS ASSUMES THEY MAKE THE SECOND PUTT, MAYBE WE TWEAK THAT LATER
        }

        trimmedPutts.push({
          distance: putt.distance,
          xDistance: roundTo(-1 * (width / 2 - putt.point.x) * (5 / width), 2),
          yDistance: roundTo(-1 * (height / 2 - putt.point.y) * (5 / height), 2),
          break: putt.break,
          missRead: putt.missRead,
          distanceMissed: putt.distanceMissed
        });
      }
    });

    updateField("loading", true)
    // Add a new document in collection "cities"
    setDoc(doc(db, `users/${auth.currentUser.uid}/sessions`, generatePushID()), {
      date: new Date().toISOString(),
      timestamp: new Date().getTime(),
      difficulty: difficulty,
      holes: holes,
      mode: mode,
      putts: trimmedPutts,
      type: "round-simulation"
    }).then(() => {
      router.push({
        pathname: `/simulation/recap`,
        params: {
          current: true,
          holes: holes,
          difficulty: difficulty,
          mode: mode,
          serializedPutts: JSON.stringify(trimmedPutts),
          date: new Date().toISOString()
        }
      });
    });

    const sfDocRef = doc(db, `users/${auth.currentUser.uid}`);

    runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(sfDocRef);
      if (!sfDoc.exists()) {
        throw "Document does not exist!";
      }

      const newPutts = sfDoc.data().totalPutts + totalPutts;
      transaction.update(sfDocRef, {totalPutts: newPutts});
    }).then(() => {
      console.log("Transaction successfully committed!");
    }).catch((e) => {
      console.log("Transaction failed: ", e);
    });

  }

  return (loading ? <Loading/> :
      <ThemedView>
        <ThemedView style={{
          borderColor: colors.border.default,
          justifyContent: "center",
          alignContent: "center",
          width: "100%",
          borderBottomWidth: 1,
          paddingTop: 6,
          paddingBottom: 10,
          marginBottom: 8
        }}>
          <Text style={{
            textAlign: "center",
            fontSize: 16,
            fontWeight: "medium",
            color: colors.text.primary
          }}>9 Hole Simulation</Text>
          <Image source={require('@/assets/images/PuttLabLogo.png')}
                 style={{position: "absolute", left: 12, top: -2, width: 35, height: 35}}/>
        </ThemedView>
        <View style={{width: "100%", paddingHorizontal: 24}}>
          <View style={{display: "flex", flexDirection: "column", marginBottom: 12}}>
            <ThemedText style={{marginBottom: 6}} type="title">Hole {hole}</ThemedText>
            <GreenVisual imageSource={greenMaps[puttBreak[0] + "," + puttBreak[1]]} distance={distance}
                         puttBreak={breaks[puttBreak[0]]} slope={slopes[puttBreak[1]]}></GreenVisual>

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
                <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} width={20}
                     height={20} stroke={colors.button.danger.text}>
                  <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                </Svg> :
                <SvgClose width={20} height={20} stroke={colors.button.danger.text}></SvgClose>
              }
              <Text style={{color: 'white', marginLeft: 8}}>Misread</Text>
            </Pressable>
            <View>
              <View style={{alignSelf: "center", flexDirection: "row", justifyContent: "space-between", width: "100%"}}>
                <ThemedText></ThemedText>
                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>2 ft</ThemedText>
                <ThemedText></ThemedText>
                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>1 ft</ThemedText>
                <ThemedText></ThemedText>
                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>0 ft</ThemedText>
                <ThemedText></ThemedText>
                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>1 ft</ThemedText>
                <ThemedText></ThemedText>
                <ThemedText type="defaultSemiBold" style={{color: colors.putting.grid.text}}>2 ft</ThemedText>
                <ThemedText></ThemedText>
              </View>
              <GestureDetector gesture={singleTap}>
                <View onLayout={onLayout}
                      style={{alignSelf: "center", alignItems: "center", justifyContent: "center", width: "100%"}}>
                  <Image
                    source={require('../../assets/images/putting-grid.png')}
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
                    <Svg width={24} height={24} stroke={center ? colors.checkmark.color : colors.checkmark.bare.color}
                         xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 24 24" strokeWidth="3">
                      <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                    </Svg>
                  </View>
                  {point.x !== undefined && center !== true ? (
                    <Image source={require('../../assets/images/golf-ball.png')} style={{
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
              <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 14,}}>
                <PrimaryButton title="Back" disabled={hole === 1} onPress={() => lastHole()}></PrimaryButton>
                <DangerButton onPress={() => updateField("largeMiss", true)} title={"Miss > 5ft?"}></DangerButton>
                {hole === holes ? <PrimaryButton title="Submit" disabled={point.x === undefined} onPress={() => {
                    if (point.x !== undefined) updateField("confirmSubmit", true)
                  }}></PrimaryButton>
                  : <PrimaryButton title="Next" disabled={point.x === undefined}
                                   onPress={() => nextHole()}></PrimaryButton>}
              </View>
            </View>
          </View>
        </View>
        {(confirmLeave || confirmSubmit || largeMiss) &&
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50,
            height: '100%',
            width: '100%',
            backgroundColor: colors.background.tinted
          }}>
            {confirmLeave &&
              <ConfirmExit cancel={() => updateField("confirmLeave", false)} end={fullReset}></ConfirmExit>}
            {confirmSubmit &&
              <ConfirmSubmit cancel={() => updateField("confirmSubmit", false)} submit={submit}></ConfirmSubmit>}
            {(largeMiss && !confirmLeave) &&
              <BigMiss largeMissBy={largeMissBy} updateField={updateField} nextHole={nextHole}></BigMiss>}
          </View>}
      </ThemedView>
  );
}

function GreenVisual({distance, puttBreak, slope, imageSource}) {
  const colors = useColors();

  return (
    <View style={{
      backgroundColor: colors.putting.visual.background,
      flexDirection: "column",
      borderRadius: 16,
      elevation: 4,
      overflow: "hidden"
    }}>
      <View style={{width: "100%", flexDirection: "row", justifyContent: "center", alignContent: "center"}}>
        <Image source={imageSource} style={{
          width: "100%",
          height: "auto",
          aspectRatio: 2,
        }}></Image>
      </View>
      <View
        style={{width: "100%", flexDirection: "column", borderTopWidth: 1, borderColor: colors.putting.visual.border}}>
        <View style={{flexDirection: "row"}}>
          <View style={{
            flexDirection: "column",
            flex: 1,
            borderRightWidth: 1,
            borderColor: colors.putting.visual.border,
            paddingBottom: 12,
            paddingTop: 6,
            paddingLeft: 12
          }}>
            <Text style={{fontSize: 14, textAlign: "left", color: colors.putting.visual.secondaryText}}>Break</Text>
            <Text style={{
              fontSize: 20,
              textAlign: "left",
              color: "white",
              fontWeight: "bold"
            }}>{puttBreak}</Text>
          </View>
          <View style={{
            flexDirection: "column",
            flex: 0.7,
            borderRightWidth: 1,
            borderColor: colors.putting.visual.border,
            paddingBottom: 12,
            paddingTop: 6,
            paddingLeft: 12
          }}>
            <Text style={{fontSize: 14, textAlign: "left", color: colors.putting.visual.secondaryText}}>Slope</Text>
            <Text style={{
              fontSize: 20,
              textAlign: "left",
              color: "white",
              fontWeight: "bold"
            }}>{slope}</Text>
          </View>
          <View style={{flexDirection: "column", flex: 0.7, paddingBottom: 12, paddingTop: 6, paddingLeft: 12}}>
            <Text style={{fontSize: 14, textAlign: "left", color: colors.putting.visual.secondaryText}}>Distance</Text>
            <Text style={{
              fontSize: 20,
              textAlign: "left",
              color: "white",
              fontWeight: "bold"
            }}>{distance}ft</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

// TODO MAKE THIS UPLOAD A PARTIAL ROUND
function ConfirmExit({end, partial, cancel}) {
  const colors = useColors();

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
      flexDirection: "col"
    }}>
      <View style={{justifyContent: "center", flexDirection: "row", width: "100%"}}>
        <View style={{
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
      </View>
      <ThemedText type={"header"} style={{fontWeight: 500, textAlign: "center", marginTop: 14}}>End Session</ThemedText>
      <ThemedText type={"default"} secondary={true} style={{textAlign: "center", lineHeight: 18, marginTop: 10}}>Are you
        sure you want to end this session? You can always upload the partial round, otherwise all data will be lost.
        This action cannot be undone.</ThemedText>
      <Pressable onPress={end} style={({pressed}) => [{
        backgroundColor: pressed ? colors.buttonDangerDepressedBackground : colors.button.danger.background,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 16
      }]}>
        <Text style={{textAlign: "center", color: colors.button.danger.text, fontWeight: 500}}>End
          Session</Text>
      </Pressable>
      <SecondaryButton onPress={partial} title={"Upload as Partial"} style={{ marginTop: 10, paddingVertical: 10, borderRadius: 10 }}></SecondaryButton>
      <SecondaryButton onPress={cancel} title={"Cancel"} style={{ marginTop: 10, paddingVertical: 10, borderRadius: 10 }}></SecondaryButton>
    </View>
  )
}

function ConfirmSubmit({submit, cancel}) {
  const colors = useColors();

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
          <Svg width={24} height={24} stroke={colors.checkmark.color} xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 24 24" strokeWidth="3">
            <Path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
          </Svg>
        </View>
      </View>
      <ThemedText type={"header"} style={{fontWeight: 500, textAlign: "center", marginTop: 14}}>Submit
        Session</ThemedText>
      <ThemedText type={"default"} secondary={true} style={{textAlign: "center", lineHeight: 18, marginTop: 8}}>Done
        putting? Submit to find out if you should celebrate—or blame the slope, the wind, and your shoes.</ThemedText>
      <PrimaryButton onPress={submit} title={"Submit"} style={{ paddingVertical: 10, borderRadius: 10, marginTop: 32 }}></PrimaryButton>
      <SecondaryButton onPress={cancel} title={"Cancel"} style={{ paddingVertical: 10, borderRadius: 10, marginTop: 10 }}></SecondaryButton>
    </ThemedView>
  )
}

function BigMiss({largeMissBy, updateField, nextHole}) {
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
      <View style={{width: "100%", flexDirection: "row", justifyContent: "flex-end"}}>
        <SecondaryButton onPress={() => updateField("largeMiss", false)}
                       style={{padding: 3, borderRadius: 8}}>
            <SvgClose stroke={colors.button.secondary.text} width={24} height={24}></SvgClose>
        </SecondaryButton>
      </View>
      <View style={{flexDirection: "column", justifyContent: "space-between", alignItems: "center", marginBottom: 24}}>
        <View style={{
          height: 48,
          aspectRatio: 1,
          alignContent: "center",
          flexDirection: "row",
          justifyContent: "center",
          borderRadius: 50,
          backgroundColor: colors.button.danger.background
        }}>
          <Text style={{color: "white", fontWeight: 600, fontSize: 24, marginTop: 6}}>!</Text>
        </View>
        <View style={{marginTop: 12}}>
          <ThemedText type={"header"} style={{fontWeight: 500, textAlign: "center"}}>Miss &gt;3ft</ThemedText>
          <ThemedText type={"default"} secondary={true} style={{textAlign: "center", lineHeight: 18, marginTop: 10}}>Putting
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
          nextHole();
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
