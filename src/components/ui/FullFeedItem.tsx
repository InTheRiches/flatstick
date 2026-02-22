import { Pressable, View, ViewStyle, Image, ImageStyle, TextStyle } from "react-native"

import { Scorecard } from "@/components/golf/Scorecard/Scorecard"
import { Text } from "@/components/ui/Text"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

export function FullFeedItem() {
  const { themed } = useAppTheme()

  return (
    <View style={$container}>
      <Pressable
        style={themed($authorContainer)}
        onPress={() => {
          // Handle author press, e.g., navigate to author's profile
        }}
      >
        <View style={$authorInfo}>
          <View style={themed($avatar)}>
            <Image source={require("@assets/branding/FlatstickMallet.png")} style={$avatarImg} />
          </View>
          <View style={$authorText}>
            <Text style={themed($author)}>Hayden Williams</Text>
            <Text style={themed($club)}>At Moors Golf Club</Text>
          </View>
          <Text style={themed($date)}>2/17/26</Text>
        </View>
      </Pressable>
      <Scorecard topMargin={false} roundedBottom={false} />
    </View>
  )
}

const $container: ViewStyle = {
  paddingBottom: 24,
  marginBottom: 24,
}

const $authorContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: 8,
}

const $author: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontSize: 20,
  fontWeight: "bold",
})

const $avatar: ThemedStyle<ViewStyle> = (theme) => ({
  borderRadius: 50,
  backgroundColor: "white",
  padding: 8,
  borderWidth: 1,
  borderColor: theme.colors.palette.emerald,
})

const $authorText: ViewStyle = { marginLeft: 8, flex: 1, paddingRight: 2 }

const $avatarImg: ImageStyle = {
  width: 32,
  height: 32,
}

const $club: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontSize: 15,
  marginTop: -4,
})

const $date: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontSize: 16,
})

const $authorInfo: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
}
