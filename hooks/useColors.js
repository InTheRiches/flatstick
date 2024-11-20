import { useColorScheme } from 'react-native';
import {useMemo} from "react";
import {DarkTheme, LightTheme} from "@/constants/ModularColors";

export default function useColors() {
  const colorScheme = useColorScheme();  // Automatically returns 'light' or 'dark'

  return useMemo(() => colorScheme === "light" ? LightTheme : DarkTheme, [colorScheme]);
}