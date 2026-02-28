import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface TreeIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  background?: string;
  opacity?: number;
  rotation?: number;
  shadow?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  padding?: number;
}

const TreeIcon: React.FC<TreeIconProps> = ({
  size = 45,
  color = '#DEDEDE',
  strokeWidth = 4,
  background = 'transparent',
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0,
}) => {
  const transforms: string[] = [];
  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBoxSize = 45 + padding * 2;
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <Svg
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      style={{
        opacity,
        transform: transforms.join(' ') || undefined,
        // drop-shadow filter is not supported in native; safe fallback:
        backgroundColor: background !== 'transparent' ? background : undefined,
      }}
    >
      <Rect
        x="2"
        y="2"
        width="41"
        height="41"
        rx="20.5"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      <Path
        d="M30.502 10.5C30.9215 10.5 31.3284 10.6431 31.6562 10.9053L36.1475 14.4961C37.3303 15.4409 37.348 16.9884 36.625 18.0117L38.2178 19.3418C39.6129 20.5058 39.325 22.5182 38.0615 23.4189L39.6992 24.9697C41.358 26.5405 40.2717 29.377 37.9727 29.377H33.7158V31.2812C33.7158 32.4999 32.7381 33.4998 31.5195 33.5H29.4824C28.2638 33.4999 27.2861 32.4999 27.2861 31.2812V29.376H23.0273C20.7287 29.376 19.6427 26.5418 21.2998 24.9707L22.9375 23.416C21.6771 22.5138 21.3911 20.504 22.7842 19.3408L24.3789 18.0088C23.6571 16.9858 23.6744 15.4391 24.8584 14.4932L29.3477 10.9062C29.6755 10.644 30.0824 10.5001 30.502 10.5Z"
        fill={color}
        stroke="white"
      />

      <Path
        d="M14.502 10.5C14.9215 10.5 15.3284 10.6431 15.6562 10.9053L20.1475 14.4961C21.3303 15.4409 21.348 16.9884 20.625 18.0117L22.2178 19.3418C23.6129 20.5058 23.325 22.5182 22.0615 23.4189L23.6992 24.9697C25.358 26.5405 24.2717 29.377 21.9727 29.377H17.7158V31.2812C17.7158 32.4999 16.7381 33.4998 15.5195 33.5H13.4824C12.2638 33.4999 11.2861 32.4999 11.2861 31.2812V29.376H7.02734C4.72873 29.376 3.64273 26.5418 5.2998 24.9707L6.9375 23.416C5.67709 22.5138 5.39108 20.504 6.78418 19.3408L8.37891 18.0088C7.65711 16.9858 7.67436 15.4391 8.8584 14.4932L13.3477 10.9062C13.6755 10.644 14.0824 10.5001 14.502 10.5Z"
        fill={color}
        stroke="white"
      />

      <Path
        d="M23.9772 13.3365C23.6997 13.1186 23.3563 13 23.0026 13C22.6489 13 22.3055 13.1186 22.028 13.3365L16.8295 17.4137C15.5641 18.4057 15.7181 20.1366 16.7383 21.0286L14.437 22.9141C12.9232 24.1545 13.5362 26.4618 15.2387 26.9664L12.7455 29.2878C11.1956 30.7297 12.2236 33.3135 14.3474 33.3135H19.8571V36.0473C19.8571 37.1252 20.7374 38 21.822 38H24.18C25.2646 38 26.1449 37.1252 26.1449 36.0473V33.3151H31.6531C33.7768 33.3151 34.8049 30.7297 33.2534 29.2878L30.7587 26.9695C32.4658 26.4696 33.082 24.1576 31.5651 22.9157L29.2669 21.0317C30.2886 20.1397 30.4411 18.4073 29.1773 17.4169L23.9772 13.3365Z"
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
    </Svg>
  );
};

export default TreeIcon;