import type { HeatmapMode } from '@/components/app/golf/putting/GreenHeatmapOverlay';
import { Text } from '@/components/ui/Text';
import { useAppTheme } from '@/theme/context';
import { ThemedStyle } from '@/theme/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, TextStyle, View, ViewStyle } from 'react-native';

interface PuttingActionBarProps {
  onSavePutt?: () => void;
  hasPendingPutt: boolean;
  onGPSPress?: () => void;
  onUndoPress?: () => void;
  isActive?: boolean;
  heatmapMode?: HeatmapMode;
  onHeatmapToggle?: () => void;
  hasLidar?: boolean;
  roundSettings: {
        gpsEnabled: boolean;
        showPreviousShots: boolean;
        showHolePath: boolean;
        highContrast: boolean;
        useMetric: boolean;
    };
}

export const PuttingActionBar: React.FC<PuttingActionBarProps> = ({
  onSavePutt,
  hasPendingPutt,
  onGPSPress,
  onUndoPress,
  isActive = false,
  heatmapMode = 'none',
  onHeatmapToggle,
  hasLidar = false,
  roundSettings,
}) => {
  const { theme, themed } = useAppTheme();
  const translateX = useRef(new Animated.Value(isActive ? 0 : 0)).current;
  const opacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const [mounted, setMounted] = useState(isActive);

  useEffect(() => {
    const screenW = Dimensions.get('window').width;
    if (isActive) {
      setMounted(true);
      // slide in from right
      translateX.setValue(screenW * 0.5);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      // slide out to right then unmount
      Animated.parallel([
        Animated.timing(translateX, { toValue: Dimensions.get('window').width * 0.6, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [isActive, translateX, opacity]);

  if (!mounted) return null;

  return (
    <Animated.View style={[$container, { transform: [{ translateX }], opacity } as any]}>
      <View style={themed($topOverlay)}>
        <Pressable
            style={({pressed}) => [themed($actionButton), pressed && themed($actionButtonActive), !roundSettings.gpsEnabled && { opacity: 0.35 }]}
            onPress={roundSettings.gpsEnabled ? onGPSPress : undefined}
        >
            <Ionicons 
                name="location" 
                size={24} 
                color={theme.colors.buttons.textColor} 
            />
        </Pressable>
        <Pressable
            style={({pressed}) => [
                themed($actionButton),
                pressed && themed($actionButtonActive),
                heatmapMode !== 'none' && $heatmapButtonActive,
                !hasLidar && { opacity: 0.35 },
            ]}
            onPress={hasLidar ? onHeatmapToggle : undefined}
        >
            <Ionicons
                name={
                    heatmapMode === 'elevation' ? 'trending-up'
                    : heatmapMode === 'slope' ? 'analytics'
                    : 'layers-outline'
                }
                size={22}
                color={heatmapMode !== 'none' ? '#ffffff' : theme.colors.buttons.textColor}
            />
        </Pressable>
        <Pressable
            style={({pressed}) => [themed($actionButton), pressed && themed($actionButtonActive)]}
            onPress={onUndoPress}
        >
            <Ionicons 
                name="arrow-undo" 
                size={22} 
                color={theme.colors.buttons.textColor} 
            />
        </Pressable>
        <Pressable
            style={({pressed}) => [themed($saveButton), pressed && themed($actionButtonActive), !hasPendingPutt && { opacity: 0.5 }]}
            onPress={hasPendingPutt ? onSavePutt : undefined}
        >
            <Ionicons name="checkmark" size={24} color={themed($actionButtonText).color} />
            <Text style={[themed($actionButtonText)]}>Save</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

export const $container: ViewStyle = {
  position: "absolute",
  bottom: 160,
  left: 0,
  right: 0,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
};

export const $topOverlay: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
  backgroundColor: theme.colors.backgrounds.elevated,
  borderRadius: 30,
  padding: 6,
});

export const $actionButton: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: 999,
  backgroundColor: theme.colors.buttons.background
});

export const $saveButton: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  height: 48,
  paddingHorizontal: 20,
  borderRadius: 999,
  backgroundColor: theme.colors.buttons.background
});

export const $actionButtonActive: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.buttons.pressed.background,
});

export const $actionButtonText: ThemedStyle<TextStyle> = (theme) => ({
  marginLeft: 6,
  fontSize: 14,
  fontWeight: '600',
  color: theme.colors.buttons.textColor,
});

export const $actionButtonTextActive: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.buttons.textColor,
});

export const $heatmapButtonActive: ViewStyle = {
  backgroundColor: '#1A6B3A',
};
