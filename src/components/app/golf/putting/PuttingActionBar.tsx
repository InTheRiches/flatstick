import { Text } from '@/components/ui/Text';
import { useAppTheme } from '@/theme/context';
import { ThemedStyle } from '@/theme/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, TextStyle, ViewStyle } from 'react-native';

interface PuttingActionBarProps {
    onSavePutt?: () => void;
    hasPendingPutt: boolean;
    onGPSPress?: () => void;
  isActive?: boolean;
}

export const PuttingActionBar: React.FC<PuttingActionBarProps> = ({
  onSavePutt,
  hasPendingPutt,
  onGPSPress,
  isActive = false,
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
    <Animated.View style={[ $container, { transform: [{ translateX }], opacity } as any ]}>
        <Pressable
            style={({pressed}) => [themed($actionButton), pressed && themed($actionButtonActive)]}
            onPress={onGPSPress}
        >
            <Ionicons 
                name="location" 
                size={24} 
                color={theme.colors.text} 
            />
        </Pressable>
        <Pressable
            style={({pressed}) => [themed($actionButton), pressed && themed($actionButtonActive)]}
            onPress={() => {}}
        >
            <Ionicons 
                name="arrow-undo" 
                size={22} 
                color={theme.colors.text} 
            />
        </Pressable>
        {hasPendingPutt && (
            <Pressable
                style={({pressed}) => [themed($saveButton), pressed && themed($actionButtonActive)]}
                onPress={onSavePutt}
            >
                <Ionicons name="checkmark" size={24} color={themed($actionButtonText).color} />
                <Text style={[themed($actionButtonText)]}>Save</Text>
            </Pressable>
        )}
    </Animated.View>
  );
};

export const $container: ViewStyle = {
  position: 'absolute',
  bottom: 120,
  alignSelf: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 100,
  padding: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 5,
};

export const $actionButton: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 999,
  backgroundColor: theme.colors.backgrounds.default,
  borderWidth: 1,
  borderColor: theme.colors.border
});

export const $saveButton: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  height: 40,
  paddingHorizontal: 12,
  borderRadius: 999,
  backgroundColor: theme.colors.backgrounds.default,
  borderWidth: 1,
  borderColor: theme.colors.border
});

export const $actionButtonActive: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.border,
});

export const $actionButtonText: ThemedStyle<TextStyle> = (theme) => ({
  marginLeft: 6,
  fontSize: 14,
  fontWeight: '600',
  color: theme.colors.palette.black,
});

export const $actionButtonTextActive: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.buttons.textColor,
});
    