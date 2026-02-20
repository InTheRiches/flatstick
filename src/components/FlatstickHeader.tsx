import { Image, Pressable, View, ViewStyle, ImageStyle } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

type FlatstickHeaderProps = {
  bottomBorder?: boolean
  onPressSettings?: () => void
}

export function FlatstickHeader({ bottomBorder = false, onPressSettings }: FlatstickHeaderProps) {
  const router = useRouter()
  const { themed, theme } = useAppTheme()

  const handlePressSettings = () => {
    if (onPressSettings) return onPressSettings()
    router.push({ pathname: "/" })
  }

  return (
    <View style={themed($container(bottomBorder))}>
      <View style={themed($row(bottomBorder))}>
        {/* Left spacer so logo stays perfectly centered */}
        <View style={styles.side} />

        {/* Center logo */}
        <View style={styles.center}>
          <Image
            source={require("@assets/branding/FlatstickWithMallet.png")}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>

        {/* Right action */}
        <View style={styles.side}>
          <Pressable
            onPress={handlePressSettings}
            hitSlop={10}
            style={({ pressed }) => themed($settingsButton(pressed))}
          >
            <Ionicons name="settings-sharp" size={22} color={theme.colors.backgrounds.default} />
          </Pressable>
        </View>
      </View>

      {/* Optional: place AdMob / secondary content here */}
      {/* <View style={{ alignItems: "center" }}>
        ...ad...
      </View> */}
    </View>
  )
}

const $container =
  (bottomBorder: boolean): ThemedStyle<ViewStyle> =>
  (theme) => ({
    width: "100%",
    paddingTop: theme.spacing.sm,
    // Now you have access to both the theme and your variable
    marginBottom: bottomBorder ? 0 : theme.spacing.xs,
  })

const $row =
  (bottomBorder: boolean): ThemedStyle<ViewStyle> =>
  (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: bottomBorder ? 1 : 0,
    borderBottomColor: theme.colors.border,
    paddingBottom: bottomBorder ? theme.spacing.sm : 0,
    marginBottom: bottomBorder ? theme.spacing.md : theme.spacing.xs,
  })

const $settingsButton =
  (pressed: boolean): ThemedStyle<ViewStyle> =>
  (theme) => ({
    backgroundColor: theme.colors.buttons.background,
    opacity: pressed ? 0.85 : 1,
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  })

const styles = {
  side: {
    width: 44, // keeps center perfectly centered; also matches typical touch target width
    alignItems: "flex-end",
    justifyContent: "center",
  } satisfies ViewStyle,

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  } satisfies ViewStyle,

  logo: {
    height: 45,
    aspectRatio: 180/34, // original logo dimensions; ensures it scales proportionally
  } satisfies ImageStyle,
}
