import React from "react";
import { ActivityIndicator, View, type ViewStyle } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";

export const CourseLoadingView: React.FC = () => {
    const { theme } = useAppTheme();

    return (
        <Screen>
            <View style={$centeredFill}>
                <ActivityIndicator size="large" color={theme.colors.tint} />
                <Text style={{ marginTop: 12, color: theme.colors.textDim }} text="Loading course data…" />
            </View>
        </Screen>
    );
};

const $centeredFill: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
};
