import {StatusBar, View} from "react-native";

// make a screen wrapper which wraps its children in a view
export default function ScreenWrapper({children, style = {}, ...props}) {
    return (
        <View style={[{marginTop: StatusBar.currentHeight, flex: 1}, style]} {...props}>
            {children}
        </View>
    );
}