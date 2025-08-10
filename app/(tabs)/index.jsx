import React, {useCallback, useEffect, useRef, useState} from 'react';
import useColors from "@/hooks/useColors";
import {ActivityIndicator, FlatList, Image, Platform, RefreshControl, Text, View} from "react-native";
import {Header} from "@/components/tabs/home";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import ScreenWrapper from "@/components/general/ScreenWrapper";
import {BannerAd, BannerAdSize, TestIds, useForeground} from "react-native-google-mobile-ads";
import {collection, getDocs, limit, orderBy, query, startAfter} from "firebase/firestore";
import {auth, firestore} from "@/utils/firebase";
import FontText from "@/components/general/FontText";
import {BareScorecardCard} from "@/components/simulations/full/ScorecardCard";
import {useAppContext} from "@/contexts/AppContext";
import {convertUnits} from "@/utils/Conversions";

const bannerAdId = __DEV__ ? TestIds.BANNER : Platform.OS === "ios" ? "ca-app-pub-2701716227191721/1882654810" : "ca-app-pub-2701716227191721/3548415690";
const PAGE_SIZE = 10;

export default function HomeScreen() {
    const colors = useColors();
    const {userData} = useAppContext();
    const [sessions, setSessions] = useState([]);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const bannerRef = useRef(null);

    useForeground(() => {
        bannerRef.current?.load();
    })

    const loadInitial = useCallback(async () => {
        setLoadingInitial(true);
        try {
            const feedQuery = query(
                collection(firestore, `userFeed/${auth.currentUser.uid}/feedItems`),
                orderBy('timestamp', 'desc'),
                limit(PAGE_SIZE)
            );
            const snapshot = await getDocs(feedQuery);
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('snapshot.docs:', auth.currentUser.uid, snapshot.docs.length, docs.length);
            setSessions(docs);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
        } catch (e) {
            console.error('Error loading userfeed:', e);
        }
        setLoadingInitial(false);
    }, [auth.currentUser.uid]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const feedQuery = query(
                collection(firestore, `userFeed/${auth.currentUser.uid}/feedItems`),
                orderBy('timestamp', 'desc'),
                startAfter(lastDoc),
                limit(PAGE_SIZE)
            );
            const snapshot = await getDocs(feedQuery);
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSessions(prev => [...prev, ...docs]);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            if (snapshot.docs.length < PAGE_SIZE) setHasMore(false);
        } catch (e) {
            console.error('Error loading more userfeed:', e);
        }
        setLoadingMore(false);
    }, [auth.currentUser.uid, lastDoc, loadingMore, hasMore]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadInitial();
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    const renderFooter = () => {
        if (!loadingMore && !hasMore) {
            return (
                <View style={{backgroundColor: colors.background.secondary, alignItems: "center", justifyContent: "center", marginTop: 16, paddingHorizontal: 6, paddingVertical: 12, borderRadius: 12}}>
                    <Text style={{color: colors.text.secondary, width: "100%", textAlign: "center", fontSize: 16, fontWeight: 500}}>No more activity, come back when your friends post more sessions!</Text>
                </View>
            )
        }
        if (!loadingMore) return null;
        return (
            <View style={{ padding: 16 }}>
                <ActivityIndicator size="small" />
            </View>
        );
    };

    const handleEndReached = () => {
        if (!loadingMore && hasMore) {
            loadMore();
        }
    };

    const renderItem = ({ item }) => {
        if (item.session.type === "full") {
            return (
                <View style={{ borderBottomWidth: 1, borderColor: '#ddd', paddingBottom: 24 }}>
                    <View style={{flexDirection: "row", alignItems: "center", marginBottom: 8}}>
                        <View style={{flex: 1, flexDirection: "row", alignItems: "center"}}>
                            <View style={{ borderRadius: 50, backgroundColor: 'white', padding: 8 }}>
                                <Image source={require('../../assets/branding/FlatstickMallet.png')} style={{ width: 40, height: 40 }} />
                            </View>
                            <View style={{marginLeft: 8}}>
                                <Text style={{color: colors.text.primary, fontSize: 20, fontWeight: 500}}>Hayden Williams</Text>
                                <Text style={{ color: colors.text.secondary, fontSize: 15}}>At {item.specifics.courseName}</Text>
                            </View>
                        </View>
                        <Text style={{ color: colors.text.secondary, fontSize: 16}}>{new Date(item.session.date).toLocaleDateString()}</Text>
                    </View>
                    <BareScorecardCard data={item.specifics.scorecard} front={true}/>
                    <View style={{backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.default, borderBottomLeftRadius: 16, borderBottomRightRadius: 16}}>
                        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border.default }}>
                            <View style={{flexDirection: "column", flex: 0.6, borderRightWidth: 1, borderColor: colors.border.default, paddingBottom: 8, paddingTop: 6, paddingLeft: 12,}}>
                                <FontText style={{fontSize: 13, textAlign: "left", fontWeight: 700, color: colors.text.tertiary,}}>HOLES</FontText>
                                <FontText numberOfLines={1} ellipsizeMode="tail" style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold", flexShrink: 1}}>{item.stats.holesPlayed}</FontText>
                            </View>
                            <View style={{flexDirection: "column", flex: 1, borderRightWidth: 1, borderColor: colors.border.default, paddingBottom: 8, paddingTop: 6, paddingLeft: 12,}}>
                                <FontText style={{fontSize: 13, textAlign: "left", fontWeight: 700, color: colors.text.tertiary,}}>1 PUTTS</FontText>
                                <FontText numberOfLines={1} ellipsizeMode="tail" style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold", flexShrink: 1}}>{item.stats.puttCounts[0]}</FontText>
                            </View>
                            <View style={{flexDirection: "column", flex: 1, paddingBottom: 8, paddingTop: 6, paddingLeft: 12,}}>
                                <FontText style={{fontSize: 13, textAlign: "left", fontWeight: 700, color: colors.text.tertiary,}}>AVG DISTANCE</FontText>
                                <FontText numberOfLines={1} ellipsizeMode="tail" style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold", flexShrink: 1}}>{convertUnits(item.stats.avgMiss, item.session.units, userData.preferences.units)}{userData.preferences.units === 0 ? "ft" : "m"}</FontText>
                            </View>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <View style={{flexDirection: "column", flex: 0.6, borderRightWidth: 1, borderColor: colors.border.default, paddingBottom: 8, paddingTop: 6, paddingLeft: 12,}}>
                                <FontText style={{fontSize: 13, textAlign: "left", fontWeight: 700, color: colors.text.tertiary,}}>SG</FontText>
                                <FontText numberOfLines={1} ellipsizeMode="tail" style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold", flexShrink: 1}}>12</FontText>
                            </View>
                            <View style={{flexDirection: "column", flex: 1, borderRightWidth: 1, borderColor: colors.border.default, paddingBottom: 8, paddingTop: 6, paddingLeft: 12,}}>
                                <FontText style={{fontSize: 13, textAlign: "left", fontWeight: 700, color: colors.text.tertiary,}}>PUTTS</FontText>
                                <FontText numberOfLines={1} ellipsizeMode="tail" style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold", flexShrink: 1}}>{item.stats.totalPutts}</FontText>
                            </View>
                            <View style={{flexDirection: "column", flex: 1, paddingBottom: 8, paddingTop: 6, paddingLeft: 12,}}>
                                <FontText style={{fontSize: 13, textAlign: "left", fontWeight: 700, color: colors.text.tertiary,}}>AVG MISS</FontText>
                                <FontText numberOfLines={1} ellipsizeMode="tail" style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold", flexShrink: 1}}>{item.stats.avgMiss}</FontText>
                            </View>
                        </View>
                    </View>
                </View>
            )
        }
    };

    return (
        <BottomSheetModalProvider>
            <ScreenWrapper>
                <View style={{
                    flex: 1,
                    flexDirection: "column",
                    alignContent: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.default,
                    paddingHorizontal: 20,
                }}>
                    <FlatList
                        ListHeaderComponent={<Header bottomBorder={true}/>}
                        data={sessions}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        onEndReached={handleEndReached}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    />
                </View>
                <View style={{position: "absolute", bottom: 0}}>
                    <BannerAd ref={bannerRef} unitId={bannerAdId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                </View>
            </ScreenWrapper>
        </BottomSheetModalProvider>
    );
}