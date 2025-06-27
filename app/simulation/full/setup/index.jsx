import React, {useEffect, useRef, useState} from "react";
import {ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View,} from "react-native";
import {useNavigation} from "@react-navigation/native";
import ScreenWrapper from "../../../../components/general/ScreenWrapper";
import Svg, {Path} from "react-native-svg";
import FontText from "../../../../components/general/FontText";
import useColors from "../../../../hooks/useColors";
import {NewFullRound} from "../../../../components/tabs/home/popups/NewFullRound";

const GOLF_API_KEY = "P3YWERWFDOPBUUV66UDLRJDTLY"; // Replace with your real key

async function searchGolfCourses(query) {
    if (!query) return [];

    try {
        const res = await fetch(
            `https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(query)}`,
            {
                headers: {
                    Authorization: `Key ${GOLF_API_KEY}`,
                },
            }
        );
        const data = (await res.json()).courses;
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Search failed:", err);
        return [];
    }
}

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const toRad = deg => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function parseTees(teesData) {
    const parsed = {"male": [], "female": []};

    for (const gender of ["male", "female"]) {
        const genderTees = teesData[gender] || [];

        for (const tee of genderTees) {
            parsed[gender].push({
                name: tee.tee_name,
                par: tee.par_total,
                rating: tee.course_rating,
                slope: tee.slope_rating,
                yards: tee.total_yards,
                holes: tee.holes,
            });
        }
    }

    return parsed;
}

export default function GolfCourseSearchScreen() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const colors = useColors();
    const newFullRoundRef = useRef(null);
    const navigation = useNavigation();
    const [tees, setTees] = useState({});
    const [course, setCourse] = useState({});

    const setSearchQuery = (newQuery) => {
        if (query === newQuery) {
            return;
        }

        setQuery(newQuery);
    }

    // Request location
    useEffect(() => {
        (async () => {
            // const {status} = await Location.requestForegroundPermissionsAsync();
            // if (status !== "granted") {
            //     Alert.alert("Permission denied", "Location permission is required.");
            //     setLoading(false);
            //     return;
            // }
            // 42.204390, -85.630628
            //const userLoc = await Location.getCurrentPositionAsync({});
            const userLoc = {
                coords: {
                    latitude: 42.204390,
                    longitude: -85.630628
                }
            }
            setLocation(userLoc.coords);
        })();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (query.length > 2) {
                setLoading(true);
                searchGolfCourses(query).then((data) => {
                    const sortedCourses = data
                        .map((item) => {
                            const distance = Math.round(haversine(
                                location.latitude,
                                location.longitude,
                                item.location.latitude,
                                item.location.longitude
                            ) / 1000);
                            return {...item, distance};
                        })
                        .sort((a, b) => a.distance - b.distance);

                    setResults(sortedCourses);
                    setLoading(false);
                }).catch((e) => {
                    console.log("error: " + e);
                });
            } else {
                setResults([]);
            }
        }, 200); // debounce
        return () => clearTimeout(timeout);

    }, [query, location]);

    return (
        <>
            <ScreenWrapper>
                <View style={{paddingBottom: 25, paddingHorizontal: 20, gap: 12, width: "100%"}}>
                    <View style={{flexDirection: "row", alignItems: "center", gap: 12}}>
                        <Pressable onPress={() => {
                            navigation.goBack()
                        }} style={{padding: 4, paddingLeft: 0}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3}
                                 stroke={colors.text.primary} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                            </Svg>
                        </Pressable>
                        <FontText style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Find
                            Courses</FontText>
                    </View>
                    <View>
                        <TextInput
                            placeholder={"Search for your course..."}
                            style={{
                                backgroundColor: colors.input.background,
                                color: colors.input.text,
                                borderWidth: 1,
                                borderColor: colors.input.border,
                                borderRadius: 12,
                                padding: 12,
                                fontSize: 16,
                            }}
                            placeholderTextColor={colors.text.secondary}
                            onChangeText={setSearchQuery}

                        />
                        {loading && (
                            <View style={{position: "absolute", right: 10, top: '50%', transform: [{translateY: -10}]}}>
                                <ActivityIndicator size={"small"}></ActivityIndicator>
                            </View>
                        )}
                    </View>

                    {results.length === 0 && (
                        <FontText style={{color: colors.text.secondary, textAlign: "center", fontSize: 18, fontWeight: 500}}>No courses found</FontText>
                    )}

                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({item}) => {
                            if (!item.club_name) return null; // skip if no club name
                            if (!item.location || !item.location.city || !item.location.state) return null; // skip if no location
                            const clubName = item.club_name.replace(/\s*\(\d+\)$/, "");
                            return (
                                <Pressable key={"course-" + item.id} style={({pressed}) => [{
                                    padding: 8,
                                    backgroundColor: pressed ? colors.button.primary.depressed : colors.background.secondary,
                                    borderRadius: 14,
                                    marginBottom: 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12
                                }]} onPress={() => {
                                    setCourse(item);
                                    setTees(parseTees(item.tees));
                                    newFullRoundRef.current.present();
                                }}>
                                    <View style={{flexDirection: "row", flex: 1}}>
                                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                             fill={colors.text.secondary} width={48} height={48}>
                                            <Path fillRule="evenodd"
                                                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                                  clipRule="evenodd"/>
                                        </Svg>
                                        <View style={{marginLeft: 6, flex: 1}}>
                                            <FontText style={{
                                                color: colors.text.primary,
                                                fontSize: 16,
                                                fontWeight: 500
                                            }}>{clubName}</FontText>
                                            <View style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginTop: 4,
                                                justifyContent: "space-between"
                                            }}>
                                                <FontText style={{
                                                    color: colors.text.secondary,
                                                    fontSize: 14
                                                }}>{item.location.city}, {item.location.state}</FontText>
                                                <FontText style={{
                                                    color: colors.text.secondary,
                                                    fontSize: 14
                                                }}>{item.distance > 0 ? item.distance : "<1"}km</FontText>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{
                                        backgroundColor: colors.button.secondary.background,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        aspectRatio: 1,
                                        borderRadius: 24,
                                        paddingHorizontal: 8
                                    }}>
                                        <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                                             viewBox="0 0 24 24" strokeWidth={2}
                                             stroke={colors.button.secondary.text} className="size-6">
                                            <Path strokeLinecap="round" strokeLinejoin="round"
                                                  d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                                        </Svg>
                                    </View>
                                </Pressable>
                            )
                        }}
                    />
                </View>
            </ScreenWrapper>
            <NewFullRound newFullRoundRef={newFullRoundRef} tees={tees} course={course}></NewFullRound>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
        backgroundColor: "#fff",
    },
    searchBar: {
        marginHorizontal: 16,
        marginBottom: 8,
    },
    center: {
        padding: 20,
        alignItems: "center",
    },
    card: {
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
    },
    title: {
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 4,
    },
});