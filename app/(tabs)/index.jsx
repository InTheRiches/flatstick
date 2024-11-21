import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {Pressable, View, Text} from 'react-native';
import {ThemedButton} from "@/components/ThemedButton";
import {Image} from 'react-native';

import {NewSession} from '@/components/popups/NewSession';
import React, {useEffect, useState} from 'react';
import {getAuth} from "firebase/auth";
import {doc, getDoc, getFirestore, query, limit, orderBy, collection, getDocs} from "firebase/firestore";
import {useNavigation, useRouter} from "expo-router";
import {useSession} from '@/contexts/ctx';
import {SvgClose, SvgMenu} from "@/assets/svg/SvgComponents";
import Svg, {Path} from "react-native-svg";
import useColors from "@/hooks/useColors";
import {Dimensions} from 'react-native';
import {PrimaryButton} from "@/components/buttons/PrimaryButton";

export default function HomeScreen() {
  const colors = useColors();

  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();
  const {signOut, isLoading} = useSession();

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
    <ThemedView style={{
      height: "100%",
      flex: 1,
      overflow: "hidden",
      flexDirection: "column",
      alignContent: "center",
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
    }}>
      <Header signOut={signOut}></Header>
      <View style={{marginTop: 12, paddingHorizontal: 20}}>
        <Profile userData={userData} auth={auth}></Profile>
        <View style={{
          backgroundColor: colors.background.secondary,
          borderColor: colors.border.default,
          flexDirection: "column",
          paddingTop: 12,
          borderRadius: 16,
          borderWidth: 1
        }}>
          <View style={{width: "100%", paddingBottom: 12, flexDirection: "row", justifyContent: "space-between"}}>
            <Text style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.text.primary,
              textAlign: "left",
              marginLeft: 14,
              maxWidth: "50%"
            }}>Recent Sessions</Text>
            <PrimaryButton onPress={() => setNewSession(true)} style={{ height: "32", width: "32", alignItems: "center", justifyContent: "center", flexDirection: "row", borderRadius: 8, marginRight: 12 }}>
              <Text style={{textAlign: "center", color: colors.button.primary.text, fontSize: 20}}>+</Text>
            </PrimaryButton>
          </View>
          <RecentSessions router={router} setNewSession={setNewSession}/>
        </View>
      </View>
      {newSession && <View style={{
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
        <NewSession setNewSession={setNewSession}></NewSession>
      </View>}
    </ThemedView>
  );
}

function Profile({userData, auth}) {
  const colors = useColors();

  return (
    <View style={{
      borderColor: colors.border.default,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      borderBottomWidth: 1,
      paddingBottom: 24,
      marginBottom: 24
    }}>
      <View style={{flexDirection: "row", alignItems: "center"}}>
        <Image source={require('../../assets/images/image.png')} style={{width: 60, height: 60, borderRadius: 30}}/>
        <View style={{marginLeft: 12}}>
          <ThemedText type="subtitle">{auth.currentUser.displayName}</ThemedText>
          <ThemedText
            type="default">Since {(userData === undefined || userData.length === 0) ? "~~~~" : new Date(userData.date).getFullYear()}</ThemedText>
          <ThemedText
            type="default">{(userData === undefined || userData.length === 0) ? "~" : userData.totalPutts} Total
            Putts</ThemedText>
        </View>
      </View>
      <View style={{flexDirection: "column", justifyContent: "center", alignContent: "center"}}>
        <View style={{
          overflow: "hidden",
          width: 56,
          height: 56,
          borderRadius: 50,
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          marginBottom: 1,
          backgroundColor: colors.background.secondary,
          borderColor: colors.border.default
        }} type="secondary">
          <ThemedText type="header" style={{lineHeight: 26, zIndex: 20, color: colors.text.primary}}>1.8</ThemedText>
        </View>
        <ThemedText type="defaultSemiBold"
                    style={{alignSelf: 'flex-start', fontSize: 16, width: "auto", textAlign: "center"}}>Strokes
          Gained</ThemedText>
      </View>
    </View>
  )
}

function Header({signOut}) {
  const colors = useColors();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={{
      borderColor: colors.border.default,
      justifyContent: "center",
      alignContent: "center",
      width: "100%",
      borderBottomWidth: 1,
      paddingTop: 2,
      paddingBottom: 10,
    }}>
      <Text style={{fontSize: 20, fontWeight: "bold", color: colors.text.primary, marginLeft: 54}}>PuttLab</Text>
      <Image source={require('@/assets/images/PuttLabLogo.png')}
             style={{position: "absolute", left: 12, top: -2, width: 35, height: 35}}/>
      {menuOpen ?
        <Pressable onPress={() => setMenuOpen(false)} style={{position: "absolute", right: 2, top: -14, padding: 12}}>
          <SvgClose width={32} height={32} stroke={"#484A4B"}></SvgClose>
        </Pressable> :
        <Pressable onPress={() => setMenuOpen(true)} style={{position: "absolute", right: 8, bottom: 4, padding: 12}}>
          <SvgMenu width={21} height={17} stroke={"#484A4B"}></SvgMenu>
        </Pressable>}
      {menuOpen && (
        <View style={{position: "absolute", width: "100%", top: "100%", marginTop: 14, zIndex: 50}}>
          <View style={{
            backgroundColor: colors.background.primary,
            borderBottomWidth: 1,
            borderColor: colors.border.default,
            paddingHorizontal: 12,
            paddingBottom: 12,
            paddingTop: 12
          }}>
            <Pressable style={({pressed}) => [{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: pressed ? colors.background.secondary : colors.background.primary,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 8
            }]}>
              <Svg width={32} height={32} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   strokeWidth={1.5} stroke={colors.text.primary}>
                <Path strokeLinecap="round" strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
              </Svg>
              <Text style={{fontSize: 16, marginLeft: 6, color: colors.text.primary}}>Your Profile</Text>
            </Pressable>
            <Pressable style={({pressed}) => [{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: pressed ? colors.background.secondary : colors.background.primary,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 8
            }]}>
              <Svg width={32} height={32} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   strokeWidth={1.5} stroke={colors.text.primary}>
                <Path strokeLinecap="round" strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/>
                <Path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
              </Svg>
              <Text style={{fontSize: 16, marginLeft: 6, color: colors.text.primary}}>Setting</Text>
            </Pressable>
            <Pressable onPress={() => signOut()} style={({pressed}) => [{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: pressed ? colors.background.secondary : colors.background.primary,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 8
            }]}>
              <Svg width={32} height={32} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   strokeWidth={1.5} stroke={colors.text.primary}>
                <Path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/>
              </Svg>
              <Text style={{fontSize: 16, marginLeft: 6, color: colors.text.primary}}>Log Out</Text>
            </Pressable>
          </View>
          {/*the 0.05 removes the weird spacing between the dark overlay and the header*/}
          <View style={{
            backgroundColor: colors.background.tinted,
            height: Dimensions.get("window").height,
            marginTop: -0.05
          }}>

          </View>
        </View>
      )
      }
    </View>
  )
}

// TODO Consider adding a see more button that brings up a dedication menu with a insights graphic for each session
function RecentSessions({setNewSession}) {
  const auth = getAuth();
  const db = getFirestore();

  const navigation = useNavigation();

  const [recentSessions, setRecentSessions] = useState([]);
  const [listedSessions, setListedSessions] = useState([null]);
  const [loading, setLoading] = useState(true)

  const colors = useColors();

  const pressed = (session) => {
    navigation.navigate("simulation/recap/index", {
      current: false,
      holes: session.holes,
      difficulty: session.difficulty,
      mode: session.mode,
      serializedPutts: JSON.stringify(session.putts),
      date: session.date
    });
  }

  useEffect(() => {
    const q = query(collection(db, "users/" + auth.currentUser.uid + "/sessions"), orderBy("timestamp", "desc"), limit(3));
    getDocs(q).then((querySnapshot) => {
      let docs = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        docs.push(doc.data());
      });

      setListedSessions(docs.map((session, index) => {
        let putts = 0;
        session.putts.forEach((putt) => {
          if (putt.distanceMissed === 0) putts++;
          else putts += 2;
        });

        const date = new Date(session.date);

        return (
          <Pressable onPress={(e) => pressed(session)} key={session.timestamp} style={({pressed}) => [{
            backgroundColor: pressed ? colors.background.primary : "transparent",
            borderBottomLeftRadius: index < docs.length - 1 ? 0 : 15,
            borderBottomRightRadius: index < docs.length - 1 ? 0 : 15
          }, {
            width: "100%",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderColor: colors.border.default,
            flexDirection: "row",
            justifyContent: "space-between",
            alignContent: "center"
          }]}>
            <View>
              <ThemedText>{session.type === "round-simulation" ? session.holes + " Hole Simulation" : "N/A"}</ThemedText>
              <ThemedText secondary={true} style={{
                fontSize: 13,
                marginTop: -6
              }}>{(date.getMonth() + 1) + "/" + date.getDate()}</ThemedText>
            </View>
            <View style={{flexDirection: "row", gap: 12, width: "50%", height: "auto", alignItems: "center"}}>
              <ThemedText
                style={{width: "50%"}}>{session.type === "round-simulation" ? session.difficulty : "N/A"}</ThemedText>
              <ThemedText style={{width: "50%"}}>{session.type === "round-simulation" ? putts : "N/A"}</ThemedText>
            </View>
          </Pressable>
        )
      }));

      setRecentSessions(docs);
    }).catch((error) => {
      console.log("couldnt find the documents: " + error)
    });
  }, []);

  useEffect(() => {
    if (listedSessions[0] !== null)
      setLoading(false);
  }, [recentSessions])

  return loading ? <View></View> : recentSessions.length === 0 ? (
    <View style={{
      alignItems: "center",
      padding: 24,
      paddingVertical: 48,
      borderTopWidth: 1,
      borderColor: colors.border.default
    }}>
      <ThemedText type="subtitle">No sessions</ThemedText>
      <ThemedText secondary={true} style={{textAlign: "center", marginBottom: 24}}>No putts to review — it’s like the
        green’s waiting for you. Start a new session to show the green you’re serious this time… or at least slightly
        less terrible.</ThemedText>
      <ThemedButton onPress={() => setNewSession(true)} title="New session"></ThemedButton>
    </View>
  ) : (
    <View style={{alignContent: "center", borderTopWidth: 1, borderColor: colors.border.default}}>
      <View style={{
        width: "100%",
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: "row",
        justifyContent: "space-between"
      }}>
        <Text style={{textAlign: "left", color: "#898989"}}>Sessions</Text>
        <View style={{flexDirection: "row", gap: 12, width: "50%"}}>
          <Text style={{textAlign: "left", color: "#898989", width: "50%"}}>Difficulty</Text>
          <Text style={{textAlign: "left", color: "#898989", width: "50%"}}>Total Putts</Text>
        </View>
      </View>
      {listedSessions}

    </View>
  );
}