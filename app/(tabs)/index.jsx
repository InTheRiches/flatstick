import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {Pressable, View, Text} from 'react-native';
import {ThemedButton} from "@/components/ThemedButton";
import {useColorScheme} from '@/hooks/useColorScheme';
import {Image} from 'react-native';
import {Colors} from '@/constants/Colors';

import {NewSession} from '@/components/popups/NewSession';
import React, {useEffect, useState} from 'react';
import {getAuth} from "firebase/auth";
import {doc, getDoc, getFirestore, query, limit, orderBy, collection, getDocs} from "firebase/firestore";
import {useRouter} from "expo-router";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  const [newSession, setNewSession] = useState(false);

  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const docRef = doc(db, `users/${auth.currentUser.uid}`);
    getDoc(docRef).then((data) => {
      setUserData(data.data());
    })
      .catch((error) => {

      });
  })

  return (
    <ThemedView style={{ flex: 1, overflow: "hidden", flexDirection: "column", alignContent: "center", borderBottomWidth: 1, borderBottomColor: Colors[colorScheme ?? "light"].border}}>
      <View style={{
            borderColor: Colors[colorScheme ?? 'light'].border,
            justifyContent: "center",
            alignContent: "center",
            width: "100%",
            borderBottomWidth: 1,
            paddingTop: 2,
            paddingBottom: 10
        }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "white", marginLeft: 54}}>PuttLab</Text>
        <Image source={require('@/assets/images/PuttLabLogo.png')}
               style={{position: "absolute", left: 12, top: -2, width: 35, height: 35}}/>
      </View>
      <View style={{ marginTop: 12, paddingHorizontal: 20 }}>
        <View style={{borderColor: Colors[colorScheme ?? 'light'].border}}
                    className={"flex-row items-center justify-between w-full border-b-[1px] pb-6 mb-10"}>
          <View className={"flex-row items-center"}>
            <Image source={require('../../assets/images/image.png')} style={{width: 60, height: 60, borderRadius: 30}}/>
            <View className={"ml-4"}>
              <ThemedText type="subtitle">{auth.currentUser.displayName}</ThemedText>
              <ThemedText
                type="default">Since {(userData === undefined || userData.length === 0) ? "~~~~" : new Date(userData.date).getFullYear()}</ThemedText>
              <ThemedText
                type="default">{(userData === undefined || userData.length === 0) ? "~" : userData.totalPutts} Total
                Putts</ThemedText>
            </View>
          </View>
          <View className="flex-col items-center justify-center">
            <View style={{overflow: "hidden"}} type="secondary"
                        className={"w-[56px] h-[56px] rounded-full items-center justify-center border-[1px] mb-1 border-[#96c7f2]"}>
              <Image source={require('../../assets/images/pixelGradient.png')}
                     style={{position: "absolute", left: 0, width: 60, height: 60, zIndex: 10}}/>
              <ThemedText type="header" style={{lineHeight: 26, zIndex: 20, color: "#0081f1"}}>1.8</ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={{fontSize: 16}}>Strokes Gained</ThemedText>
          </View>
        </View>
        <View style={{ backgroundColor: "#272922", borderColor: "#484A4B", flexDirection: "column", paddingTop: 12, borderRadius: 16, borderWidth: 1 }}>
          <View style={{width: "100%", paddingBottom: 12, borderBottomWidth: 1, borderColor: "#484A4B", flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "white", textAlign: "left", marginLeft: 14, maxWidth: "50%" }}>Recent Sessions</Text>
            <Pressable onPress={() => setNewSession(true)} style={({pressed}) => [{backgroundColor: pressed ? '#525E3A' : '#677943'}, {
                         borderRadius: 8,
                         height: "32",
                         width: "32",
                         flexDirection: "row",
                         justifyContent: "center",
                         alignItems: "center",
                         marginRight: 12
                     }]}>
              <Text style={{ textAlign: "center", color: "white", fontSize: 20 }}>+</Text>
            </Pressable>
          </View>
          <RecentSessions router={router} colorScheme={colorScheme} setNewSession={setNewSession}/>
        </View>
      </View>
      {newSession && <View className="absolute inset-0 flex items-center justify-center z-50 h-screen w-full"
                           style={{backgroundColor: colorScheme == 'light' ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.8)"}}>
        <NewSession setNewSession={setNewSession}></NewSession>
      </View>}
    </ThemedView>
  );
}

function RecentSessions({ router, colorScheme, setNewSession}) {
  const auth = getAuth();
  const db = getFirestore();

  const [recentSessions, setRecentSessions] = useState([])
  const [listedSessions, setListedSessions] = useState([])

  const pressed = (session) => {
    router.push({ pathname: `/simulation/recap`, params: { current: false, holes: session.holes, difficulty: session.difficulty, mode: session.mode, serializedPutts: JSON.stringify(session.putts), date: new Date(session.date) }});
  }

  // TODO THIS PRODUCES A FLASHING, ADD A LOADING USESTATE AND CREATE A PLACEHOLDER UNTIL IT LOADS FOR A SMOOTHER EXPERIENCE
  useEffect(() => {
    const q = query(collection(db, "users/" + auth.currentUser.uid + "/sessions"), orderBy("timestamp"), limit(3));

    getDocs(q).then((querySnapshot) => {
      let docs = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        docs.push(doc.data());
      });

      setListedSessions(docs.map((session) => {
        let putts = 0;
        session.putts.forEach((putt) => {
          if (putt.distanceMissed === 0) putts++;
          else putts += 2;
        });

        const date = new Date(session.date);

        return (
          <Pressable onPress={(e) => pressed(session)} key={session.timestamp} style={({ pressed }) => [{ backgroundColor: pressed ? "#393A35" : "transparent", borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }, { width: "100%", paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderColor: "#484A4B", flexDirection: "row", justifyContent: "space-between", alignContent: "center" }]}>
            <View>
              <ThemedText>{session.type === "round-simulation" ? session.holes + " Hole Simulation" : "N/A"}</ThemedText>
              <ThemedText secondary={true} style={{ fontSize: 13, marginTop: -6 }}>{date.getMonth() + "/" + date.getDay()}</ThemedText>
            </View>
            <View style={{ flexDirection: "row", gap: 12, width: "50%", height: "auto", alignItems: "center" }}>
              <ThemedText style={{ width: "50%" }}>{session.type === "round-simulation" ? session.difficulty : "N/A"}</ThemedText>
              <ThemedText style={{ width: "50%" }}>{session.type === "round-simulation" ? putts : "N/A"}</ThemedText>
            </View>
          </Pressable>
        )
      }));

      setRecentSessions(docs);
    }).catch((error) => {
      console.log("couldnt find the documents")
    });
  }, []);

  return recentSessions.length === 0 ? (
    <View style={{borderColor: Colors[colorScheme ?? 'light'].border}}
                className={"border items-center rounded-lg border-solid p-12 py-[40px]"}>
      <ThemedText type="subtitle">No sessions</ThemedText>
      <ThemedText secondary={true} className="text-center mb-8">Start a session to simulate 18 holes of make or break
        putts.</ThemedText>
      <ThemedButton onPress={() => setNewSession(true)} title="New session"></ThemedButton>
    </View>
  ) : (
    <View style={{alignContent: "center"}}>
      <View style={{
        width: "100%",
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: "row",
        justifyContent: "space-between"
      }}>
        <Text style={{ textAlign: "left", color: "#898989" }}>Sessions</Text>
        <View style={{ flexDirection: "row", gap: 12, width: "50%"}}>
          <Text style={{ textAlign: "left", color: "#898989", width: "50%" }}>Difficulty</Text>
          <Text style={{ textAlign: "left", color: "#898989", width: "50%" }}>Total Putts</Text>
        </View>
      </View>
      {listedSessions}

    </View>
  );
}