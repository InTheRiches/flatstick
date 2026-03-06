import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  secondary?: string;
  opacity?: number;
  rotation?: number;
  shadow?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  padding?: number;
}

const TreeIcon: React.FC<IconProps> = ({
  size = 45,
  color = '#DEDEDE',
  strokeWidth = 4,
  secondary = 'transparent',
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
        stroke={secondary}
      />

      <Path
        d="M14.502 10.5C14.9215 10.5 15.3284 10.6431 15.6562 10.9053L20.1475 14.4961C21.3303 15.4409 21.348 16.9884 20.625 18.0117L22.2178 19.3418C23.6129 20.5058 23.325 22.5182 22.0615 23.4189L23.6992 24.9697C25.358 26.5405 24.2717 29.377 21.9727 29.377H17.7158V31.2812C17.7158 32.4999 16.7381 33.4998 15.5195 33.5H13.4824C12.2638 33.4999 11.2861 32.4999 11.2861 31.2812V29.376H7.02734C4.72873 29.376 3.64273 26.5418 5.2998 24.9707L6.9375 23.416C5.67709 22.5138 5.39108 20.504 6.78418 19.3408L8.37891 18.0088C7.65711 16.9858 7.67436 15.4391 8.8584 14.4932L13.3477 10.9062C13.6755 10.644 14.0824 10.5001 14.502 10.5Z"
        fill={color}
        stroke={secondary}
      />

      <Path
        d="M23.9772 13.3365C23.6997 13.1186 23.3563 13 23.0026 13C22.6489 13 22.3055 13.1186 22.028 13.3365L16.8295 17.4137C15.5641 18.4057 15.7181 20.1366 16.7383 21.0286L14.437 22.9141C12.9232 24.1545 13.5362 26.4618 15.2387 26.9664L12.7455 29.2878C11.1956 30.7297 12.2236 33.3135 14.3474 33.3135H19.8571V36.0473C19.8571 37.1252 20.7374 38 21.822 38H24.18C25.2646 38 26.1449 37.1252 26.1449 36.0473V33.3151H31.6531C33.7768 33.3151 34.8049 30.7297 33.2534 29.2878L30.7587 26.9695C32.4658 26.4696 33.082 24.1576 31.5651 22.9157L29.2669 21.0317C30.2886 20.1397 30.4411 18.4073 29.1773 17.4169L23.9772 13.3365Z"
        fill={color}
        stroke={secondary}
        strokeWidth={2}
      />
    </Svg>
  );
};

const BunkerIcon: React.FC<IconProps> = ({
  size = 45,
  color = '#DEDEDE',
  strokeWidth = 4,
  secondary = 'transparent',
  opacity = 1,
  rotation = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0,
}) => {
  const transforms: string[] = [];
  if (rotation) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBox = `${-padding} ${-padding} ${45 + padding * 2} ${46 + padding * 2}`;

  return (
    <Svg
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      style={{
        opacity,
        transform: transforms.join(' ') || undefined,
      }}
    >
      {/* Outer circular container */}
      <Rect
        x="2"
        y="2"
        width="41"
        height="41"
        rx="20.5"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {/* Sand dots */}
      <Path
        d="M18 16C17.447 16 17 15.553 17 15C17 14.447 17.447 14 18 14C18.553 14 19 14.447 19 15C19 15.553 18.553 16 18 16Z"
        fill={color}
      />

      <Path
        d="M16 19C15.447 19 15 18.553 15 18C15 17.447 15.447 17 16 17C16.553 17 17 17.447 17 18C17 18.553 16.553 19 16 19Z"
        fill={color}
      />

      <Path
        d="M20 19C19.447 19 19 18.553 19 18C19 17.447 19.447 17 20 17C20.553 17 21 17.447 21 18C21 18.553 20.553 19 20 19Z"
        fill={color}
      />

      {/* Main bunker curve */}
      <Path
        d="M3 23.5276C3 23.5276 5.99191 21.1379 12.3491 21C23.2542 21.6131 30.0667 32.0454 40 33"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lower curve (flattened from mask) */}
      <Path
        d="M21.2215 23.5018C32.203 19.2334 40.9982 26.9378 40.9982 26.9378"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner contour circle */}
      <Path
        d="M12.0212 18.9569C12.0212 14.4038 15.6751 10.7241 20.1947 10.7241C24.715 10.7241 28.3682 14.4045 28.3682 18.9569C28.3682 21.9175 26.8233 24.5088 24.5 25.9593L23.5 25.5L17 22L12.274 21M12.0212 18.9569C12.0212 19.6623 12.1089 20.3469 12.274 21M12.0212 18.9569L12.274 21"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const GreenIcon: React.FC<IconProps> = ({
  size = 45,
  color = '#DEDEDE',
  strokeWidth = 4,
  secondary = 'transparent',
  opacity = 1,
  rotation = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0,
}) => {
  const transforms: string[] = [];
  if (rotation) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBox = `${-padding} ${-padding} ${45 + padding * 2} ${45 + padding * 2}`;

  return (
    <Svg
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      style={{
        opacity,
        transform: transforms.join(' ') || undefined,
      }}
    >
      <Rect x="2" y="2" width="41" height="41" rx="20.5" stroke={color} strokeWidth={strokeWidth} />

      <Path
        d="M23.5384 26V20.1786L31.5487 16.4476C31.6832 16.3851 31.7974 16.2841 31.8774 16.1568C31.9574 16.0295 32 15.8812 32 15.7298C32 15.5784 31.9574 15.4301 31.8774 15.3028C31.7974 15.1755 31.6832 15.0746 31.5487 15.012L23.0875 11.0706C22.9703 11.0161 22.8416 10.9925 22.7132 11.0021C22.5849 11.0117 22.4609 11.0541 22.3527 11.1256C22.2445 11.197 22.1555 11.2951 22.0939 11.4109C22.0322 11.5267 22 11.6565 22 11.7885V26Z"
        fill={color}
      />

      <Path
        d="M32.9641 33.0312C32.5321 30.8401 31.1921 29.0048 29.089 27.7233C27.4486 26.7236 25.4212 26.1227 23.3075 26V30.0781C23.3075 30.2951 23.2224 30.5032 23.071 30.6567C22.9195 30.8101 22.7141 30.8963 22.4999 30.8963C22.2858 30.8963 22.0804 30.8101 21.9289 30.6567C21.7775 30.5032 21.6924 30.2951 21.6924 30.0781V26C19.5787 26.1227 17.5512 26.7236 15.9109 27.7233C13.8078 29.0048 12.4678 30.8401 12.0358 33.0312C11.9853 33.272 11.9883 33.5212 12.0445 33.7607C12.1007 34.0002 12.2087 34.224 12.3608 34.416C12.6646 34.7955 13.1123 35 13.617 35H31.3829C31.8876 35 32.3358 34.7929 32.6396 34.416C32.7916 34.224 32.8995 34.0001 32.9556 33.7606C33.0118 33.5211 33.0147 33.272 32.9641 33.0312Z"
        fill={color}
      />
    </Svg>
  );
};

const FairwayIcon: React.FC<IconProps> = ({
  size = 45,
  color = '#DEDEDE',
  strokeWidth = 4,
  secondary = 'transparent',
  opacity = 1,
  rotation = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0,
}) => {
  const transforms: string[] = [];
  if (rotation) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBox = `${-padding} ${-padding} ${45 + padding * 2} ${45 + padding * 2}`;

  return (
    <Svg
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      style={{
        opacity,
        transform: transforms.join(' ') || undefined,
      }}
    >
      <Defs>
        <ClipPath id="clip">
          <Rect width="45" height="45" rx="22.5" />
        </ClipPath>
      </Defs>

      <G clipPath="url(#clip)">
        <Path
          d="M3 23.9431C5.13203 30.6228 3.35469 32.5675 3.35469 32.5675L4 34L6.5 37.5L9.5 40.5L14.557 43L21.5 44.5L30 43L37.4945 39L41.2391 32.7008C41.2391 32.7008 40.8055 29.7859 43 26.7484C39.7687 27.5681 38.7219 30.1973 38.7219 30.1973L37.4945 26.1395L36.2633 28.4898L33.9656 25.3314L32.7516 30.6656L30.7766 23L29.0742 28.916L27.1539 24.6491L25.575 29.7776L24.6195 26.0276L22.0898 31.8325C22.0898 31.8325 20.4336 27.4389 18.8242 24.1348C19.2055 29.8015 17.5844 31.5107 17.5844 31.5107L15.9234 27.1434L14.557 31.8786C14.557 31.8786 12.1758 28.284 12.982 23.8353C10.4437 27.0842 10.4117 29.7003 10.4117 29.7003L9.19375 26.7419L7.77891 31.4844C7.77891 31.4844 6.9375 26.2843 3 23.9431Z"
          fill={color}
          stroke={color}
        />
      </G>

      <Rect x="2" y="2" width="41" height="41" rx="20.5" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
};

const RoughIcon: React.FC<IconProps> = ({
  size = 44,
  color = '#DEDEDE',
  strokeWidth = 4,
  secondary = 'transparent',
  opacity = 1,
  rotation = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0,
}) => {
  const transforms: string[] = [];
  if (rotation) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBox = `${-padding} ${-padding} ${44 + padding * 2} ${44 + padding * 2}`;

  return (
    <Svg
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      style={{
        opacity,
        transform: transforms.join(' ') || undefined,
      }}
    >
      <Rect
        x="2"
        y="2"
        width="40"
        height="40"
        rx="20"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      <Path
        d="M6 22.6886C10.1778 30.7728 8.99248 35.4732 8.99248 35.4732L14.6996 40.0709L22.8039 41.0933L30.6304 38.2818L33.456 35.4732C33.456 35.4732 31.8642 27.8629 38 23.0263C31.1698 23.2532 29.2235 29.529 29.2235 29.529C29.2235 29.529 27.926 21.7046 31.5831 17.5704C25.8946 18.1395 25.1628 26.229 25.1628 26.229C25.1628 26.229 24.9357 16.3386 19.7387 14C22.9936 21.8289 21.4281 29.1891 21.4281 29.1891C21.4281 29.1891 19.2035 25.5221 18.3657 20.8712C16.1723 27.4608 17.3348 30.3647 17.3348 30.3647C17.3348 30.3647 13.5773 26.0762 14.6996 16.9623C11.0875 21.7466 12.3373 28.7697 12.3373 28.7697C12.3373 28.7697 10.3211 23.036 6 22.6886Z"
        fill={color}
        stroke={color}
      />
    </Svg>
  );
};

const TeeIcon: React.FC<IconProps> = ({
  size = 45,
  color = '#DEDEDE',
  strokeWidth = 4,
  secondary = 'transparent',
  opacity = 1,
  rotation = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0,
}) => {
  const transforms: string[] = [];
  if (rotation) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBox = `${-padding} ${-padding} ${45 + padding * 2} ${45 + padding * 2}`;

  return (
    <Svg
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      style={{
        opacity,
        transform: transforms.join(' ') || undefined,
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
        d="M20.0971 26.9337C22.1798 27.6247 23.5052 27.5986 25.3874 26.8542C25.066 27.5917 24.3517 28.8248 24.3517 28.8248L23.4405 35.1289L22.0766 35.1338L21.2715 29.0336Z"
        fill={color}
        stroke={color}
      />

      <Path
        d="M22.8368 25.6736C19.0561 25.6736 16 22.6175 16 18.8368C16 15.0561 19.0561 12 22.8368 12C26.6175 12 29.6736 15.0561 29.6736 18.8368C29.6736 22.6175 26.6175 25.6736 22.8368 25.6736Z"
        fill={color}
        stroke={color}
      />
    </Svg>
  );
};

const FringeIcon: React.FC<IconProps> = ({
  size = 45,
  color = '#DEDEDE',
  strokeWidth = 4,
  secondary = 'transparent',
  opacity = 1,
  rotation = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0,
}) => {
  const transforms: string[] = [];
  if (rotation) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBox = `${-padding} ${-padding} ${45 + padding * 2} ${45 + padding * 2}`;

  return (
    <Svg
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      style={{
        opacity,
        transform: transforms.join(' ') || undefined,
      }}
    >
      {/* Outer circular container */}
      <Rect
        x="2"
        y="2"
        width="41"
        height="41"
        rx="20.5"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {/* Filled rough terrain shape */}
      <Path
        d="M3.85469 31.6725C3.85469 31.6725 5.63203 30.7228 3.5 27.4606C7.4375 28.604 8.27891 31.1435 8.27891 31.1435L9.69375 28.8274L10.9117 30.2722C10.9117 30.2722 10.4617 30.4141 13 28.8274C14 30.7437 15.057 29.681 15.057 29.681L16.4234 29.0235L18 29.8892C18 29.8892 18.5 29.8892 20 29.0235C22 30.515 22.5 29.8892 22.5 29.8892L25.1195 28.4786L26 29.681L27.6539 27.8054L29.7871 29.0235L32 28.5332L33.5 29.681L34.4656 28.1386L36.7633 29.681L37.9945 28.5332L39.2219 30.515C39.2219 30.515 39.2687 28.8789 42.5 28.4786C40.3055 29.962 40 32 40 32L37.9945 36.7674L32 40.5L22.5 43L13 40.5L8.27891 36.7674L5.5 35L4.5 32.3721L3.85469 31.6725Z"
        fill={color}
      />

      {/* Outline for crisp edge */}
      <Path
        d="M3.85469 31.6725C3.85469 31.6725 5.63203 30.7228 3.5 27.4606C7.4375 28.604 8.27891 31.1435 8.27891 31.1435L9.69375 28.8274L10.9117 30.2722C10.9117 30.2722 10.4617 30.4141 13 28.8274C14 30.7437 15.057 29.681 15.057 29.681L16.4234 29.0235L18 29.8892C18 29.8892 18.5 29.8892 20 29.0235C22 30.515 22.5 29.8892 22.5 29.8892L25.1195 28.4786L26 29.681L27.6539 27.8054L29.7871 29.0235L32 28.5332L33.5 29.681L34.4656 28.1386L36.7633 29.681L37.9945 28.5332L39.2219 30.515C39.2219 30.515 39.2687 28.8789 42.5 28.4786C40.3055 29.962 40 32 40 32L37.9945 36.7674L32 40.5L22.5 43L13 40.5L8.27891 36.7674L5.5 35L4.5 32.3721L3.85469 31.6725Z"
        stroke={color}
        strokeWidth={1}
        strokeMiterlimit={10}
      />
    </Svg>
  );
};

export { BunkerIcon, FairwayIcon, FringeIcon, GreenIcon, RoughIcon, TeeIcon, TreeIcon };

