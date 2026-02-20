import { FC, useState } from "react"
import { View, TouchableOpacity, ViewStyle, TextStyle } from "react-native"
import FeatherIcon from "@expo/vector-icons/Feather"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { useAuth } from "@/hooks/useAuth"
import {useRouter} from "expo-router";

export const SignUpScreen: FC = function SignUpScreen() {
  const $containerInsets = useSafeAreaInsetsStyle(["top"]) // match SignInScreen pattern
  const { themed, theme } = useAppTheme()
  const { signUp, signingUp, error } = useAuth()

  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSignUp() {
    setLocalError(null)

    // basic client-side validation
    if (!form.email || !form.password || !form.confirmPassword) {
      setLocalError("Please fill in all fields")
      return
    }
    if (form.password.length < 6) {
      setLocalError("Password should be at least 6 characters")
      return
    }
    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match")
      return
    }

    try {
      await signUp(form.email.trim(), form.password, form.name.trim() || undefined)
      // on success RootLayout will redirect automatically
    } catch (e) {
      // error is surfaced via hook
    }
  }

  return (
    <Screen contentContainerStyle={[$styles.screen2, $containerInsets]}>
      {/*<View style={themed($header)}>*/}
      {/*  <TouchableOpacity onPress={() => {}} style={themed($headerBack)}>*/}
      {/*    <FeatherIcon color={theme.colors.text} name="chevron-left" size={30} />*/}
      {/*  </TouchableOpacity>*/}
      {/*</View>*/}

      <Text style={themed($title)}>{"Let's Get Started!"}</Text>

      <Text style={themed($subtitle)}>
        Fill in the fields below to get started with your new account.
      </Text>

      <View style={themed($form)}>
        <View style={themed($container(false))}>
          <TextField
            label="Full Name"
            placeholder="John Doe"
            value={form.name}
            onChangeText={(name) => setForm({ ...form, name })}
          />
        </View>

        <View style={themed($container(false))}>
          <TextField
            label="Email Address"
            placeholder="john@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={form.email}
            onChangeText={(email) => setForm({ ...form, email })}
          />
        </View>

        <View style={themed($container(false))}>
          <TextField
            label="Password"
            placeholder="********"
            secureTextEntry
            autoCorrect={false}
            value={form.password}
            onChangeText={(password) => setForm({ ...form, password })}
          />
        </View>

        <View style={themed($container(true))}>
          <TextField
            label="Confirm Password"
            placeholder="********"
            secureTextEntry
            autoCorrect={false}
            value={form.confirmPassword}
            onChangeText={(confirmPassword) => setForm({ ...form, confirmPassword })}
          />
        </View>

        {(localError || error) && (
          <Text style={{ color: "#ff4d4f", marginBottom: 8 }}>{localError ?? error}</Text>
        )}

        <View style={themed($formAction)}>
          <Button
            text={signingUp ? "Creating account..." : "Get Started"}
            style={themed($btn)}
            textStyle={themed($btnText)}
            onPress={handleSignUp}
            disabled={signingUp}
          />
        </View>
      </View>

      <TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")}>
        <Text style={themed($formFooter)}>
          Already have an account? <Text style={themed($link)}>Sign in</Text>
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
    // Now you have access to both the theme and your variable
    marginBottom: bottomBorder ? 0 : theme.spacing.xs,
  })

const $header: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing.md,
})

const $headerBack: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.xs,
  paddingTop: 0,
  position: "relative",
  marginLeft: -theme.spacing.md,
})

const $title: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 31,
  lineHeight: 31,
  fontWeight: "700",
  color: theme.colors.text,
  marginBottom: theme.spacing.xs / 2,
  marginTop: theme.spacing.xxl
})

const $subtitle: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 15,
  fontWeight: "500",
  color: theme.colors.textDim,
})

const $form: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.lg,
})

const $formAction: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.lg,
  marginBottom: theme.spacing.md,
})

const $formFooter: ThemedStyle<TextStyle> = (theme) => ({
  paddingVertical: theme.spacing.lg,
  fontSize: 15,
  fontWeight: "600",
  color: theme.colors.text,
  textAlign: "center",
  letterSpacing: 0.15,
})

const $link: ThemedStyle<TextStyle> = (theme) => ({
  textDecorationLine: "underline",
  color: theme.colors.tint,
})

const $btn: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tint,
  borderColor: theme.colors.tint,
  borderRadius: 30,
  borderWidth: 1,
  paddingHorizontal: theme.spacing.lg,
  paddingVertical: theme.spacing.sm,
  alignItems: "center",
  justifyContent: "center",
})

const $btnText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 18,
  lineHeight: 26,
  fontWeight: "600",
  color: theme.colors.palette.neutral100,
})

export default SignUpScreen
