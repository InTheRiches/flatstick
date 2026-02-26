import React from "react";
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";

export default function BunkerIcon({ size = 48, color = "#000" }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 868 766"
    >
      <Defs>
        <ClipPath id="cp1">
          <Path d="m479.5 402l63.24-80.58 4.36-31.95 87.02-8.41 207.64 88.8-16.89 78.35z" />
        </ClipPath>
        <ClipPath id="cp2">
          <Path d="m255.78 269.22l44.32 28.86 164.74 67.02 46.21 27.25 151-135.79-209.89-144.92-167.79 28.87z" />
        </ClipPath>
        <ClipPath id="cp3">
          <Path d="m40.04 312.81c0 0 44.52 58.42 77.9 59.1 30 0.61 698.3 27.52 704.35 24.54 6.06-2.97 5.45 217.5 5.45 217.5l-817.3-16.02z" />
        </ClipPath>
      </Defs>

      <G id="Layer1">
        {/* Circle dot 1 */}
        <Path
          d="m386 228c-5.53 0-10-4.47-10-10 0-5.53 4.47-10 10-10 5.53 0 10 4.47 10 10 0 5.53-4.47 10-10 10z"
          fill={color}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0"
          fillRule="evenodd"
        />

        {/* Main curved line */}
        <Path
          d="m63.26 338.02c0 0 58.74-45.06 183.55-47.66 214.1 11.56 347.85 208.27 542.87 226.27"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="18"
          fillRule="evenodd"
        />

        {/* Small vertical marker */}
        <Path
          d="m69 334v18h-7v-18z"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="6"
          fillRule="evenodd"
        />

        {/* Circle dot 2 */}
        <Path
          d="m352 276c-5.53 0-10-4.47-10-10 0-5.53 4.47-10 10-10 5.53 0 10 4.47 10 10 0 5.53-4.47 10-10 10z"
          fill={color}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0"
          fillRule="evenodd"
        />

        {/* Circle dot 3 */}
        <Path
          d="m417 273c-5.53 0-10-4.47-10-10 0-5.53 4.47-10 10-10 5.53 0 10 4.47 10 10 0 5.53-4.47 10-10 10z"
          fill={color}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0"
          fillRule="evenodd"
        />

        {/* Clipped curved line 1 */}
        <G clipPath="url(#cp1)">
          <Path
            d="m409.34 335.16c211.82-81.74 381.47 65.8 381.47 65.8"
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="18"
            fillRule="evenodd"
          />
        </G>

        {/* Clipped circle */}
        <G clipPath="url(#cp2)">
          <Path
            d="m423 403c-69.13 0-125-55.88-125-125 0-69.13 55.88-125 125-125 69.13 0 125 55.88 125 125 0 69.13-55.88 125-125 125z"
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="18"
            fillRule="evenodd"
          />
        </G>

        {/* Clipped rectangle */}
        <G clipPath="url(#cp3)">
          <Path
            d="m791 338v231h-728v-231z"
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="18"
            fillRule="evenodd"
          />
        </G>
      </G>
    </Svg>
  );
}