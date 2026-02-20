import { useState, FC } from "react"
import { View, Image, TouchableOpacity, ViewStyle, TextStyle, ImageStyle } from "react-native"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { useAuth } from "@/hooks/useAuth"

export const SignInScreen: FC = function SignInScreen() {
  const $containerInsets = useSafeAreaInsetsStyle(["top"]) // keep consistent with other screens
  const { themed } = useAppTheme()
  const { signIn, signingIn, error } = useAuth()

  const [emptyFieldsError, setEmptyFieldsError] = useState(false)

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  async function handleSignIn() {
    try {
      if (!form.email.trim() || !form.password) {
        // Don't attempt sign in if either field is empty; but set error state so user gets feedback
        setEmptyFieldsError(true)
        return
      }
      await signIn(form.email.trim(), form.password)
      // RootLayout will redirect on auth state change, so no navigation here
    } catch (e) {
      // error is surfaced via hook; nothing more needed here
    }
  }

  return (
    <Screen contentContainerStyle={[$styles.screen, $containerInsets]}>
      <View style={themed($container(false))}>
        <View style={themed($header)}>
          <Image
            accessible
            accessibilityLabel="App Logo"
            resizeMode="contain"
            style={themed($headerImg)}
            source={require("@assets/branding/FlatstickMallet.png")}
          />

          <Text style={themed($title)}>
            Sign in to <Text style={themed($highlight)}>Flatstick</Text>
          </Text>

          <Text style={themed($subtitle)}>Get access to your portfolio and more</Text>
        </View>

        <View style={themed($form)}>
          <View style={themed($container(false))}>
            <TextField
              label="Email address"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              keyboardType="email-address"
              onChangeText={(email) => {
                setEmptyFieldsError(false)
                setForm({ ...form, email })
              }}
              placeholder="john@example.com"
              value={form.email}
              status={emptyFieldsError ? "error" : undefined}
              containerStyle={themed($container(false))}
            />
          </View>

          <View style={themed($container(false))}>
            <TextField
              label="Password"
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={(password) => {
                setEmptyFieldsError(false)
                setForm({ ...form, password })
              }}
              placeholder="********"
              secureTextEntry
              value={form.password}
              status={emptyFieldsError ? "error" : undefined}
              containerStyle={themed($container(false))}
            />
          </View>

          {error ? <Text style={{ color: "#ff4d4f", marginBottom: 8 }}>{error}</Text> : null}
          {emptyFieldsError ? <Text style={{ color: "#ff4d4f", marginBottom: 8 }}>Please fill in both fields</Text> : null}

          <View style={themed($formAction)}>
            <Button
              text={signingIn ? "Signing in..." : "Sign in"}
              style={themed($btn)}
              textStyle={themed($btnText)}
              onPress={handleSignIn}
              disabled={signingIn}
            />
          </View>

          <TouchableOpacity onPress={() => {}}>
            <Text style={themed($formLink)}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => {}}>
        <Text style={themed($formFooter)}>
          {"Don't have an account? "}
          <Text style={themed($link)}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </Screen>
  )
}

const $container =
  (bottomBorder: boolean): ThemedStyle<ViewStyle> =>
  (theme) => ({
    width: "100%",
    paddingTop: theme.spacing.sm,
    marginBottom: bottomBorder ? 0 : theme.spacing.xs,
    alignItems: "center",
  })

const $header: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  justifyContent: "center",
  marginVertical: theme.spacing.xl,
})

const $headerImg: ThemedStyle<ImageStyle> = (theme) => ({
  alignSelf: "center",
  height: 100,
  marginBottom: theme.spacing.xl,
  width: 100,
})

const $title: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontSize: 31,
  lineHeight: 31,
  fontWeight: "700",
  marginBottom: theme.spacing.xs / 2,
})

const $highlight: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.tint,
  fontSize: 31,
})

const $subtitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontSize: 15,
  fontWeight: "500",
})

const $form: ThemedStyle<ViewStyle> = (_theme) => ({
  width: "100%",
  paddingHorizontal: 24,
})

const $formAction: ThemedStyle<ViewStyle> = (theme) => ({
  marginBottom: theme.spacing.md,
  marginTop: theme.spacing.xs,
})

const $formLink: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.tint,
  fontSize: 16,
  fontWeight: "600",
  textAlign: "center",
})

const $formFooter: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontSize: 15,
  fontWeight: "600",
  letterSpacing: 0.15,
  paddingVertical: theme.spacing.lg,
  textAlign: "center",
})

const $link: ThemedStyle<TextStyle> = (theme) => ({
  textDecorationLine: "underline",
  color: theme.colors.tint,
})

const $btn: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  backgroundColor: theme.colors.buttons.background,
  borderColor: theme.colors.buttons.border,
  borderRadius: 30,
  borderWidth: 1,
  flexDirection: "row",
  justifyContent: "center",
  paddingHorizontal: theme.spacing.lg,
  paddingVertical: theme.spacing.sm,
})

const $btnText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.buttons.textColor,
  fontSize: 18,
  fontWeight: "600",
  lineHeight: 26,
})

export default SignInScreen
