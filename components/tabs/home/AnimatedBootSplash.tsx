import React, {useEffect, useState} from "react";
import {Animated, Dimensions, Platform, View, Image, StyleSheet} from "react-native";

// Config
const useNativeDriver = Platform.OS !== "web";

type Props = {
    onAnimationEnd: () => void;
    ready: boolean;
};

export const AnimatedBootSplash = ({onAnimationEnd, ready}: Props) => {
    const [opacity] = useState(() => new Animated.Value(1));
    const [translateY] = useState(() => new Animated.Value(0));

    useEffect(() => {
        if (ready) {
            const {height} = Dimensions.get("window");

            // Start animation
            Animated.stagger(250, [
                Animated.spring(translateY, {
                    useNativeDriver,
                    toValue: -50,
                }),
                Animated.spring(translateY, {
                    useNativeDriver,
                    toValue: height,
                }),
            ]).start();

            Animated.timing(opacity, {
                useNativeDriver,
                toValue: 0,
                duration: 150,
                delay: 350,
            }).start(() => {
                onAnimationEnd();
            });
        }
    }, [ready]);

    return (
        <Animated.View style={[styles.container, {opacity}]}>
            <Animated.Image
                source={require("../../../assets/bootsplash/logo.png")} // your splash logo
                style={[styles.logo, {transform: [{translateY}]}]}
                resizeMode="contain"
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#ffffff", // match your splash background color
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
    },
    logo: {
        "width": 192,
        "height": 48
    },
});