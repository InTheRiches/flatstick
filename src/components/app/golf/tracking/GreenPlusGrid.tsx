import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";

import { useAppTheme } from "@/theme/context";
import type { XYPoint } from "@/models/geo";
import { isPointInPolygonXY } from "@/utils/courses/geometry/polygon.utils";

interface GreenPlusGridProps {
    polygon: XYPoint[];
}

export const GreenPlusGrid: React.FC<GreenPlusGridProps> = ({ polygon }) => {
    const { theme } = useAppTheme();

    const points = useMemo(() => {
        if (!polygon.length) return [] as { latitude: number; longitude: number; key: string }[];

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const point of polygon) {
            if (point.x < minX) minX = point.x;
            if (point.x > maxX) maxX = point.x;
            if (point.y < minY) minY = point.y;
            if (point.y > maxY) maxY = point.y;
        }

        const rows = 6;
        const cols = 6;
        const nextPoints: { latitude: number; longitude: number; key: string }[] = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const y = minY + (row + 0.5) * (maxY - minY) / rows;
                const x = minX + (col + 0.5) * (maxX - minX) / cols;

                if (isPointInPolygonXY({ x, y }, polygon)) {
                    nextPoints.push({
                        latitude: y,
                        longitude: x,
                        key: `plus-${row}-${col}-${x}-${y}`,
                    });
                }
            }
        }

        return nextPoints;
    }, [polygon]);

    if (!points.length) return null;

    return (
        <>
            {points.map((point) => (
                <Marker
                    key={point.key}
                    coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                    tracksViewChanges={false}
                    tappable={false}
                    anchor={{ x: 0.5, y: 0.5 }}
                    zIndex={3}
                >
                    <View style={{ width: 18, height: 18, alignItems: "center", justifyContent: "center", opacity: 0.7 }}>
                        <Ionicons name="add" size={12} color={theme.colors.textDim} />
                    </View>
                </Marker>
            ))}
        </>
    );
};
