import {Platform, StatusBar, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

// make a screen wrapper which wraps its children in a view
export default function ScreenWrapper({children, style = {}, ...props}) {
    const inset = useSafeAreaInsets();

    return (
        <View style={[{marginTop: StatusBar.currentHeight, paddingTop: inset.top, flex: 1}, style]} {...props}>
            {children}
        </View>
    );
}