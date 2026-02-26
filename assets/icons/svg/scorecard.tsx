import Svg, { Rect } from "react-native-svg";

interface ScorecardIconProps {
    width: number;
    height: number;
    darkColor?: string;
    lightColor?: string;
}

export default function ScorecardIcon({ width, height, darkColor, lightColor }: ScorecardIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 60 40" fill="none" style={{ marginRight: -2 }}>
            {/* 3 long horizontal boxes (like header rows) */}
            {[0, 1, 2].map(i => (
                <Rect
                    key={`header-${i}`}
                    x={2}
                    y={2 + i * 14}
                    width={16}
                    height={10}
                    rx={2}
                    strokeWidth={0}
                    fill={lightColor}
                />
            ))}

            {/* 2 columns of squares under the headers */}
            {[0, 1, 2].map(col =>
                Array.from({ length: 3 }).map((_, row) => (
                    <Rect
                        key={`cell-${col}-${row}`}
                        x={22 + col * 12}
                        y={2 + row * 14}
                        width={8}
                        height={10}
                        rx={2}
                        fill={darkColor}
                        strokeWidth={0}
                    />
                ))
            )}
        </Svg>
    )
}