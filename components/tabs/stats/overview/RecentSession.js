import {Pressable, View} from "react-native";
import useColors from "../../../../hooks/useColors";
import FontText from "../../../general/FontText";
import {useRouter} from "expo-router";

export const RECENT_SESSION_CONFIG = {
    "real": {
        title: (s) => `${s.stats.holesPlayed} Hole Round`,
        fields: [
            { label: "SG", value: (s) => s.stats.strokesGained },
            { label: "TOTAL PUTTS", value: (s) => s.stats.totalPutts },
        ],
    },
    "full": {
        title: (s) => `${s.stats.holesPlayed} Hole Round`,
        fields: [
            { label: "SCORE", value: (s) => s.stats.score, flex: 0.3 },
            { label: "COURSE", value: (s) => s.meta.courseName },
        ],
    },
    "sim": {
        title: (s) => `${s.stats.holesPlayed} Hole Simulation`,
        fields: [
            { label: "SG", value: (s) => s.stats.strokesGained },
            { label: "DIFFICULTY", value: (s) => s.meta.difficulty },
            { label: "TOTAL PUTTS", value: (s) => s.stats.totalPutts },
        ],
    },
};

export const RecentSession = ({ recentSession }) => {
    const colors = useColors();
    const router = useRouter();

    const config = RECENT_SESSION_CONFIG[recentSession.meta.type] ?? {
        title: () => "Unknown Session",
        fields: [],
    };

    return (
        <Pressable
            onPress={() =>
                router.push({
                    pathname: "sessions/individual",
                    params: {
                        jsonSession: JSON.stringify(recentSession),
                        recap: false
                    },
                })
            }
            style={({ pressed }) => ({
                backgroundColor: pressed
                    ? colors.button.primary.depressed
                    : colors.background.secondary,
                borderWidth: 1,
                borderColor: colors.border.default,
                borderRadius: 12,
                paddingTop: 8,
            })}
        >
            {/* Header */}
            <View
                style={{
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderColor: colors.border.default,
                    paddingBottom: 6,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <FontText
                    style={{
                        fontSize: 16,
                        textAlign: "left",
                        color: colors.text.primary,
                        fontWeight: "bold",
                        flex: 1,
                    }}
                >
                    {config.title(recentSession)}
                </FontText>
                <FontText
                    style={{
                        fontSize: 14,
                        textAlign: "right",
                        color: colors.text.tertiary,
                        fontWeight: "normal",
                        flex: 1,
                    }}
                >
                    {new Date(recentSession.meta.date).toLocaleDateString("en-US", {
                        year: "2-digit",
                        month: "2-digit",
                        day: "2-digit",
                    })}
                </FontText>
            </View>

            {/* Dynamic fields */}
            <View style={{ flexDirection: "row" }}>
                {config.fields.map((f, i) => (
                    <View
                        key={i}
                        style={{
                            flexDirection: "column",
                            flex: f.flex || 1,
                            borderRightWidth: i < config.fields.length - 1 ? 1 : 0,
                            borderColor: colors.border.default,
                            paddingBottom: 8,
                            paddingTop: 6,
                            paddingLeft: 12,
                        }}
                    >
                        <FontText
                            style={{
                                fontSize: 13,
                                textAlign: "left",
                                fontWeight: 700,
                                color: colors.text.tertiary,
                            }}
                        >
                            {f.label}
                        </FontText>
                        <FontText
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{
                                fontSize: 20,
                                color: colors.text.primary,
                                fontWeight: "bold",
                                flexShrink: 1, // important for truncation
                            }}
                        >
                            {f.value(recentSession)}
                        </FontText>
                    </View>
                ))}
            </View>
        </Pressable>
    );
};
