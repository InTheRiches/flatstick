import { useColorScheme } from 'react-native';
import {useMemo} from "react";
import {Colors} from "../constants/Colors";

export default function useColors() {
  const colorScheme = useColorScheme();  // Automatically returns 'light' or 'dark'

  return useMemo(() => Colors[colorScheme], [colorScheme]);
}