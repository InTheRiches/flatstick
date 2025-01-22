import {Link, Stack} from 'expo-router';
import {View} from "react-native";
import FontText from "@/components/general/FontText";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{title: 'Oops!'}}/>
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}>
        <FontText type="title">This screen doesn't exist.</FontText>
        <Link href="/" style={{
          marginTop: 15,
          paddingVertical: 15,
        }}>
          <FontText>Go to home screen!</FontText>
        </Link>
      </View>
    </>
  );
}
