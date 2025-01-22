import {Text} from "react-native";

export default function FontText({style = {}, children, ...props}) {
    const fontFamilies = {
        100: 'Inter_100Thin',
        200: 'Inter_200ExtraLight',
        300: 'Inter_300Light',
        400: 'Inter_400Regular',
        500: 'Inter_500Medium',
        600: 'Inter_600SemiBold',
        700: 'Inter_700Bold',
        800: 'Inter_800ExtraBold',
        900: 'Inter_900Black',
    };
    // get the font family based on style.fontWeight
    let fontFamily = style.fontWeight ? fontFamilies[style.fontWeight] : fontFamilies[3];

    return (
        <Text style={[style, {fontFamily}]} {...props}>{children}</Text>
    )
}