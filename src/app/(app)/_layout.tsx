// app/(app)/_layout.tsx
import { Tabs } from "expo-router"

export default function AppLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="social" options={{ title: "Social" }} />
      {/*<Tabs.Screen name="stats" options={{ title: "Stats" }} />*/}
      {/*<Tabs.Screen name="profile" options={{ title: "Profile" }} />*/}
    </Tabs>
  )
}
