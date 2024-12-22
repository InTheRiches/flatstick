import {useAppContext} from "../../contexts/AppCtx";
import {FlatList, Pressable, Text, View} from "react-native";
import useColors from "../../hooks/useColors";
import {useRouter} from "expo-router";

export default function Sessions({}) {
    const {puttSessions} = useAppContext();
    const colors = useColors();

    const renderItem = ({ item, index }) => (
        <Session key={"session_" + index} session={item} />
    );

    return (
        <View>
            <View style={{flexDirection: "row", borderBottomWidth: 1, borderColor: colors.border.default, paddingLeft: 12, paddingVertical: 10}}>
                <Text style={{color: colors.text.secondary, fontSize: 16, flex: 0.7, textAlign: "left"}}>Type</Text>
                <Text style={{color: colors.text.secondary, fontSize: 16, flex: 1, textAlign: "center"}}>Date</Text>
                <Text style={{color: colors.text.secondary, fontSize: 16, flex: 1, textAlign: "center"}}>Total Putts</Text>
                <Text style={{color: colors.text.secondary, fontSize: 16, flex: 1, textAlign: "center"}}>SG</Text>
            </View>
            <FlatList
                data={puttSessions}
                renderItem={renderItem}
                keyExtractor={(item, index) => "session_" + index}
            />
        </View>
    )
}

function Session({session}) {
    const colors = useColors();
    const router = useRouter();

    const condensedType = {
        "real-simulation": "Round",
        "round-simulation": "Sim"
    }
    return (
        <Pressable onPress={() => router.push({pathname: "sessions/individual", params: {jsonSession: JSON.stringify(session)}})}
                   style={({pressed}) => [{backgroundColor: pressed ? colors.button.primary.depressed : colors.button.primary.background}, {flexDirection: "row", borderBottomWidth: 1, borderColor: colors.border.default, paddingLeft: 12, paddingVertical: 10}]}>
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 0.7, textAlign: "left"}}>{condensedType[session.type]}</Text>
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{new Date(session.timestamp).toLocaleDateString('en-US', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
            })}</Text>
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{session.totalPutts}</Text>
            <Text style={{color: colors.text.primary, fontSize: 18, flex: 1, textAlign: "center"}}>{session.strokesGained}</Text>
        </Pressable>
    )
}