import { Switch } from "@/components/Toggle/Switch";
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
    settings?: {
        gpsEnabled: boolean;
        showPreviousShots: boolean;
        showHolePath: boolean;
        highContrast: boolean;
        useMetric: boolean;
    };
    onChange?: (settings: {
        gpsEnabled: boolean;
        showPreviousShots: boolean;
        showHolePath: boolean;
        highContrast: boolean;
        useMetric: boolean;
    }) => void;
}

export default function SettingsModal({ sideSheetRef, settings, onChange }: SettingsModalProps) {
    const { themed, theme } = useAppTheme();

    const handleToggle = (key: keyof NonNullable<SettingsModalProps["settings"]>, value: boolean) => {
        if (!settings || !onChange) return;
        onChange({ ...settings, [key]: value });
    };

    return (
        <SideSheetModalFactory direction="left" reference={sideSheetRef} sheetWidth={Dimensions.get("window").width * 0.75}>
            <View style={{ flex: 1}}>
                <View style={$header}>
                    <Text text={"Settings"} style={$headerText} />
                    <Pressable style={({ pressed }) => [themed($closeButton), pressed && themed($closeButtonPressed)]} onPress={() => sideSheetRef.current?.dismiss()}>
                        <UploadIcon size={24} color={"white"} rotation={-90}/>
                    </Pressable>
                </View>

                <View style={$itemRow}>
                    <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                    <Text style={$itemText} text={"Round Settings"} />
                </View>

                <View style={$itemRow}>
                    <Switch value={settings?.gpsEnabled ?? true} onValueChange={(v) => handleToggle("gpsEnabled", v)} accessibilityMode="icon" />
                    <Ionicons name="locate-outline" size={24} color={theme.colors.text} />
                    <Text style={$itemText} text={"Use GPS"} />
                </View>

                <View style={$itemRow}>
                    <Switch value={settings?.useMetric ?? false} onValueChange={(v) => handleToggle("useMetric", v)} accessibilityMode="icon" />
                    <RulerIcon size={24} color={theme.colors.text} />
                    <Text style={$itemText} text={"Use Metric System"} />
                </View>

                <View style={$itemRow}>
                    <Switch value={settings?.highContrast ?? false} onValueChange={(v) => handleToggle("highContrast", v)} accessibilityMode="icon" />
                    <Ionicons name="eye-outline" size={24} color={theme.colors.text} />
                    <Text style={$itemText} text={"High Contrast Mode"} />
                </View>

                <View style={$itemRow}>
                    <Switch value={settings?.showHolePath ?? true} onValueChange={(v) => handleToggle("showHolePath", v)} accessibilityMode="icon" />
                    <Ionicons name="analytics-outline" size={24} color={theme.colors.text} />
                    <Text style={$itemText} text={"Show Hole Path"} />
                </View>

                <View style={$itemRow}>
                    <Switch value={settings?.showPreviousShots ?? true} onValueChange={(v) => handleToggle("showPreviousShots", v)} accessibilityMode="icon" />
                    <Ionicons name="time-outline" size={24} color={theme.colors.text} />
                    <Text style={$itemText} text={"Show Previous Shots"} />
                </View>

                <Pressable style={$itemRow} onPress={() => { /* placeholder for feedback action */ }}>
                    <Ionicons name="alert-circle-outline" size={24} color={theme.colors.text} />
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
    marginBottom: 12,
    gap: 12
}

const $itemText: TextStyle = {
    fontSize: 16,
    fontWeight: 500
}

const $closeButton: ThemedStyle<ViewStyle> = (theme) => ({
    padding: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.buttons.background,
})

const $closeButtonPressed: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.buttons.pressed.background,
})