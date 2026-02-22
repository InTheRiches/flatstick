import { FC, useState, useEffect } from "react"
import {View, Alert, Switch, TouchableOpacity, ViewStyle, TextStyle, ScrollView} from "react-native"
import { useRouter } from "expo-router"
import auth, { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, FirebaseAuthTypes } from "@react-native-firebase/auth"

import { Screen } from "@/components/ui/Screen"
import { Text } from "@/components/ui/Text"
import { TextField } from "@/components/ui/TextField"
import { Button } from "@/components/ui/Button"
import { $styles } from "@/theme/styles"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import {useUser} from "@/context/UserContext"
import PageHeader from "@/components/headers/PageHeader";

export const SettingsScreen: FC = function SettingsScreen() {
    const { themed, theme, setThemeContextOverride } = useAppTheme()

    const { userProfile, authUser, syncUserProfile } = useUser()

    // Local state for form fields
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    // Auth fields
    const [email, setEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // Loading states
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isUpdatingAuth, setIsUpdatingAuth] = useState(false)

    // Load initial data
    useEffect(() => {
        if (userProfile) {
            setFirstName(userProfile.firstName || "")
            setLastName(userProfile.lastName || "")
        }
        if (authUser?.email) {
            setEmail(authUser.email)
        }
    }, [userProfile, authUser])

    // Handlers
    const handleSaveProfile = async () => {
        if (!userProfile) return
        setIsSavingProfile(true)
        try {
            await syncUserProfile({
                firstName,
                lastName,
            })
            Alert.alert("Success", "Profile updated successfully")
        } catch (_error) {
            Alert.alert("Error", "Failed to update profile")
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handleUpdateAuth = async () => {
        if (!authUser || !authUser.email) return

        // Simple validation
        if (newPassword && newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match")
            return
        }

        setIsUpdatingAuth(true)
        try {
            // Re-authenticate user before critical changes
            if (currentPassword) {
                const credential = EmailAuthProvider.credential(authUser.email, currentPassword)
                await reauthenticateWithCredential(authUser, credential)
            } else {
                // If they are trying to change password/email, they usually need to re-authenticate
                // But let's try without if they didn't provide current password (blocks will happen handled by catch)
                if (newPassword || email !== authUser.email) {
                    Alert.alert("Requirement", "Please enter your current password to confirm changes.")
                    setIsUpdatingAuth(false);
                    return;
                }
            }

            const promises = []

            // Update Email
            if (email !== authUser.email) {
                promises.push(updateEmail(authUser, email))
            }

            // Update Password
            if (newPassword) {
                promises.push(updatePassword(authUser, newPassword))
            }

            if (promises.length > 0) {
                await Promise.all(promises)
                Alert.alert("Success", "Account security updated successfully")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            }
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert("Security Check", "Please log out and log back in to perform this action.")
            } else if (error.code === 'auth/wrong-password') {
                Alert.alert("Error", "Incorrect current password.")
            } else {
                Alert.alert("Error", error.message || "Failed to update account settings")
            }
        } finally {
            setIsUpdatingAuth(false)
        }
    }

    const toggleTheme = (mode: "light" | "dark" | "system") => {
        const newModeProp = mode === "system" ? undefined : mode
        setThemeContextOverride(newModeProp)

        // Sync to user profile
        if (!userProfile)
            return;

        syncUserProfile({
            preferences: {
                ...userProfile.preferences,
                theme: mode,
            },
        })
    }

    const toggleNotifications = (value: boolean) => {
        if (!userProfile)
            return;

        syncUserProfile({
            preferences: {
                ...userProfile.preferences,
                remindersEnabled: value,
            },
        })
    }

    const toggleMishits = (value: boolean) => {
        if (!userProfile)
            return;

        syncUserProfile({
            preferences: {
                ...userProfile.preferences,
                countMishits: value,
            },
        })
    }

    const toggleUnits = (value: "imperial" | "metric") => {
        if (!userProfile)
            return;

        syncUserProfile({
            preferences: {
                ...userProfile.preferences,
                units: value,
            },
        })
    }

    const isEmailProvider = authUser?.providerData.some((p: FirebaseAuthTypes.UserInfo) => p.providerId === "password")

    // Theme Helpers
    const currentTheme = userProfile?.preferences.theme || "system"

    return (
        <Screen contentContainerStyle={$styles.screen2} preset="scroll">
            <PageHeader title={"Settings"} />

            <ScrollView contentContainerStyle={themed($content)} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <Text preset="subheading" text="Profile" style={themed($sectionTitle)} />
                <TextField
                    label="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    containerStyle={themed($field)}
                    autoCapitalize="words"
                />
                <TextField
                    label="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    containerStyle={themed($field)}
                    autoCapitalize="words"
                />
                <Button
                    text={isSavingProfile ? "Saving..." : "Save Profile"}
                    style={themed($btn)}
                    onPress={handleSaveProfile}
                    disabled={isSavingProfile}
                />

                <View style={themed($divider)} />

                {/* Preferences Section */}
                <Text preset="subheading" text="Preferences" style={themed($sectionTitle)} />

                <View style={themed($row)}>
                    <Text text="Theme" />
                    <View style={themed($themeSelector)}>
                        {(["light", "dark", "system"] as const).map((m) => (
                            <TouchableOpacity
                                key={m}
                                onPress={() => toggleTheme(m)}
                                style={[
                                    themed($themeOption),
                                    currentTheme === m && { backgroundColor: theme.colors.tint },
                                ]}
                            >
                                <Text
                                    text={m.charAt(0).toUpperCase() + m.slice(1)}
                                    style={{ color: currentTheme === m ? theme.colors.palette.neutral100 : theme.colors.text }}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={themed($row)}>
                    <Text text="Units" />
                    <View style={themed($themeSelector)}>
                        {(["imperial", "metric"] as const).map((u) => (
                            <TouchableOpacity
                                key={u}
                                onPress={() => toggleUnits(u)}
                                style={[
                                    themed($themeOption),
                                    userProfile?.preferences.units === u && { backgroundColor: theme.colors.tint },
                                ]}
                            >
                                <Text
                                    text={u.charAt(0).toUpperCase() + u.slice(1)}
                                    style={{ color: userProfile?.preferences.units === u ? theme.colors.palette.neutral100 : theme.colors.text }}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={themed($row)}>
                    <Text text="Track Mishits" />
                    <Switch
                        value={userProfile?.preferences.countMishits || false}
                        onValueChange={toggleMishits}
                        trackColor={{ false: theme.colors.palette.neutral300, true: theme.colors.tint }}
                    />
                </View>

                <View style={themed($row)}>
                    <Text text="Enable Notifications" />
                    <Switch
                        value={userProfile?.preferences.remindersEnabled || false}
                        onValueChange={toggleNotifications}
                        trackColor={{ false: theme.colors.palette.neutral300, true: theme.colors.tint }}
                    />
                </View>

                <View style={themed($divider)} />

                {/* Security Section - Conditional */}
                {isEmailProvider && (
                    <>
                        <Text preset="subheading" text="Account Security" style={themed($sectionTitle)} />
                        <TextField
                            label="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            containerStyle={themed($field)}
                        />
                        <TextField
                            label="Current Password"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                            placeholder="Required for changes"
                            containerStyle={themed($field)}
                        />
                        <TextField
                            label="New Password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            placeholder="Leave blank to keep current"
                            containerStyle={themed($field)}
                        />
                        <TextField
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="Confirm new password"
                            containerStyle={themed($field)}
                        />

                        <Button
                            text={isUpdatingAuth ? "Updating..." : "Update Security Settings"}
                            onPress={handleUpdateAuth}
                            style={themed($saveBtn)}
                            disabled={isUpdatingAuth}
                        />
                        <View style={themed($divider)} />
                    </>
                )}

                <Button text="Sign Out" preset="reversed" onPress={() => auth().signOut()} style={{ marginTop: 20 }}/>
            </ScrollView>
        </Screen>
    )
}

const $btn: ThemedStyle<ViewStyle> = (theme) => ({
    minWidth: 240,
    alignSelf: "center",
    paddingHorizontal: theme.spacing.xl
})

const $content: ThemedStyle<ViewStyle> = (theme) => ({
    paddingBottom: theme.spacing.xl
})

const $sectionTitle: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 18,
    textAlign: "left",
    width: "100%",
    fontWeight: "700",
})

const $field: ThemedStyle<ViewStyle> = (theme) => ({
    marginBottom: theme.spacing.md,
})

const $saveBtn: ThemedStyle<ViewStyle> = (theme) => ({
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
})

const $divider: ThemedStyle<ViewStyle> = (theme) => ({
    height: 1,
    backgroundColor: theme.colors.palette.neutral200,
    marginVertical: theme.spacing.lg,
})

const $row: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
})

const $themeSelector: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    backgroundColor: theme.colors.palette.neutral200,
    borderRadius: 8,
    padding: 2,
})

const $themeOption: ThemedStyle<ViewStyle> = (theme) => ({
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
})


