import {ThemedView} from "../../../components/ThemedView";
import {Colors} from "../../../constants/Colors";
import {SvgLogo} from "../../../assets/svg/SvgComponents";
import {ThemedText} from "../../../components/ThemedText";
import {useColorScheme} from "../../../hooks/useColorScheme";
import {View, Image, Text} from "react-native";
import {useState} from "react";

const initialState = {
    "width": 0,
    "height": 0
}

export default function SimulationRecap() {
    const colorScheme = useColorScheme();

    const [{width, height}, setState] = useState(initialState);

    const updateField = (field, value) => {
        setState(prevState => ({
          ...prevState,
          [field]: value,
        }));
      };

    return (
        <ThemedView className="flex-1 items-center flex-col pt-12 overflow-hidden">
            <ThemedView style={{borderColor: Colors[colorScheme ?? 'light'].border}}
                        className={"flex-row mb-4 items-center justify-center w-full border-b-[1px] pb-2 px-6"}>
                <ThemedText>Simulation</ThemedText>
                <SvgLogo style={{ position: "absolute", left: 0, top: 0, bottom: 0 }}></SvgLogo>
            </ThemedView>
            <ThemedView className={"px-6"} style={{width: "100%", height: "100%" }}>
                <ThemedText>Good Job!</ThemedText>
                <ThemedText>This is your 164th session.</ThemedText>
                <RecapVisual colorScheme={colorScheme} recapHeight={height} recapWidth={width} updateField={updateField} ></RecapVisual>
            </ThemedView>
        </ThemedView>
    )
}

function RecapVisual({ colorScheme, recapHeight, recapWidth, updateField  }) {

    const onLayout = (event) => {
        const {width, height} = event.nativeEvent.layout;

        updateField("width", width);
        updateField("height", height);
      };

    return (
        <View style={{ backgroundColor: "#333D20", flexDirection: "column", paddingVertical: 12, borderRadius: 16 }}>
            <View style={{ width: "100%", marginBottom: 12 }}>
                <Text style={{ fontSize: 16, textAlign: "center", color: Colors[colorScheme ?? 'light'].text }}>Session Recap</Text>
                <View style={{ position: "absolute", left: 12, flexDirection: "row", gap: 8 }}>
                    <Image source={require('@/assets/images/PuttLabLogo.png')} style={{width: 25, height: 25 }}/>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: Colors[colorScheme ?? 'light'].text }}>PuttLab</Text>
                </View>
            </View>
            <View style={{ width: "100%", flexDirection: "row", justifyContent: "center", alignContent: "center", maxHeight: 164 }}>
                <View onLayout={onLayout} style={{ width: "70%", marginTop: -(recapWidth-164)/2, aspectRatio: 1, backgroundColor: "#7c934f", borderColor: "#92aa5d", borderRadius: 150, flexDirection: "row", justifyContent: "center" }}>
                    <Text>12%</Text>
                    <View style={{ width: "70%", aspectRatio: 1, backgroundColor: "#9eb751", borderRadius: 150, flexDirection: "row", justifyContent: "center", alignContent: "center" }}>

                    </View>
                    <Text>18%</Text>
                </View>
            </View>
        </View>
    )
}