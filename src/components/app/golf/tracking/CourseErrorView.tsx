import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, type ViewStyle } from "react-native";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import type { CourseLoadError } from "@/services/courses/courseLoader";
import { useAppTheme } from "@/theme/context";
import { formatCourseLoadError } from "@/utils/courses/round/error.formatter";

interface CourseErrorViewProps {
    error: CourseLoadError | undefined;
    onRetry: () => void;
}

export const CourseErrorView: React.FC<CourseErrorViewProps> = ({ error, onRetry }) => {
    const { theme } = useAppTheme();
    const info = formatCourseLoadError(error);

    return (
        <Screen>
            <View style={$centeredFill}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                <Text style={{ marginTop: 12, color: theme.colors.textDim, textAlign: "center" }} text={info.title} />
                <Text style={{ marginTop: 8, color: theme.colors.textDim, textAlign: "center" }} text={info.message} />
                {info.details ? (
                    <View style={{ marginTop: 12, paddingHorizontal: 12 }}>
                        <Text
                            style={{ color: theme.colors.textDim, fontSize: 12, textAlign: "center" }}
                            text={String(info.details)}
                        />
                    </View>
                ) : null}
                <View style={{ marginTop: 20, width: 220 }}>
                    <Button text="Retry" preset="filled" onPress={onRetry} />
                </View>
            </View>
        </Screen>
    );
};

const $centeredFill: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
};
