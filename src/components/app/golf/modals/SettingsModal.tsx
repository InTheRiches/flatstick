import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import { ThemedStyle } from "@/theme/types";
import RulerIcon from "@assets/icons/svg/ruler";
import UploadIcon from "@assets/icons/svg/upload";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions, Pressable, TextStyle, View, ViewStyle } from "react-native";
import { SideSheetModalFactory } from "../../modals/SideSheetModalFactory";

interface SettingsModalProps {
    sideSheetRef: React.RefObject<{
        present: () => void;
        dismiss: () => void;
    } | null>;
}

export default function SettingsModal({ sideSheetRef }: SettingsModalProps) {
    const { themed, theme } = useAppTheme();

    return (
        <SideSheetModalFactory direction="left" reference={sideSheetRef} sheetWidth={Dimensions.get("window").width * 0.7}>
            <View style={{ flex: 1}}>
                <View style={$header}>
                    <Text text={"Settings"} style={$headerText} />
                    <Pressable style={({ pressed }) => [themed($closeButton), pressed && themed($closeButtonPressed)]} onPress={() => sideSheetRef.current?.dismiss()}>
                        <UploadIcon size={24} color={"white"} rotation={-90}/>
                    </Pressable>
                </View>
                <Pressable style={$itemRow}>
                    <Ionicons name="settings-outline" size={24} color={theme.colors.palette.white} />
                    <Text style={$itemText} text={"Round Settings"} />
                </Pressable>
                <Pressable style={$itemRow}>
                    <Ionicons name="locate-outline" size={24} color={theme.colors.palette.white} />
                    <Text style={$itemText} text={"Disable GPS"} />
                </Pressable>
                <Pressable style={$itemRow}>
                    <RulerIcon size={24} color={theme.colors.palette.white} />
                    <Text style={$itemText} text={"Use Metric System"} />
                </Pressable>
                <Pressable style={$itemRow}>
                    <Ionicons name="eye-outline" size={24} color={theme.colors.palette.white} />
                    <Text style={$itemText} text={"Disable High Contrast"} />
                </Pressable>
                <Pressable style={$itemRow}>
                    <Ionicons name="analytics-outline" size={24} color={theme.colors.palette.white} />
                    <Text style={$itemText} text={"Disable Hole Path"} />
                </Pressable>
                <Pressable style={$itemRow}>
                    <Ionicons name="alert-circle-outline" size={24} color={theme.colors.palette.white} />
                    <Text style={$itemText} text={"Report Feedback"} />
                </Pressable>
            </View>
            <Button text={"Pause & Exit"} onPress={() => {
                sideSheetRef.current?.dismiss();
            }} style={{ marginTop: 32 }} textStyle={{ marginLeft: 10 }} LeftAccessory={(props) => <Ionicons name="alert-circle-outline" size={24} color={theme.colors.palette.white} />} />
        </SideSheetModalFactory>
    )
}

const $header: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 48,
    marginTop: 16,
}

const $headerText: TextStyle = {
    fontSize: 24,
    fontWeight: 700
}

const $itemRow: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
}

const $itemText: TextStyle = {
    fontSize: 16,
    fontWeight: 500,
    marginLeft: 12,
}

const $closeButton: ThemedStyle<ViewStyle> = (theme) => ({
    padding: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.buttons.background,
})

const $closeButtonPressed: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.buttons.pressed.background,
})