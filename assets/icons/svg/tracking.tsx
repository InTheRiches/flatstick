import Svg, { Path } from 'react-native-svg';

interface TrackingIconProps {
    size?: number;
    color?: string;
}

const TrackingIcon: React.FC<TrackingIconProps> = ({ size = 30, color = '#000000' }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 256 256">
            <Path
                d="m214.2 230.05c0.09 0-17.31-154.98-162.16-183.53 172.12 13.48 203.96 183.56 203.96 183.56z"
                fill={color}
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                fillRule="evenodd"
            />
            <Path
                d="m23.75 70.5c-13.13 0-23.75-10.62-23.75-23.75 0-13.13 10.62-23.75 23.75-23.75 13.13 0 23.75 10.62 23.75 23.75 0 13.13-10.62 23.75-23.75 23.75z"
                fill={color}
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                fillRule="evenodd"
            />
        </Svg>
    );
};

export default TrackingIcon;