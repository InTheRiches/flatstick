import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from "@/components/ThemedButton";

import {SvgLogo, SvgMenu} from '../../assets/svg/SvgComponents';

import React, { useState } from 'react';
import useColors from "../../hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();

  const [ newSession, setNewSession ] = useState(false);

  return (
    <ThemedView className="flex-1 items-center flex-col pt-12 overflow-hidden">
      <ThemedView style={{ borderColor: colors.border }} className={"flex-row mb-6 items-center justify-between w-full border-b-[1px] pb-4 px-6"}>
        <SvgLogo></SvgLogo>
        <SvgMenu></SvgMenu>
      </ThemedView>
      <ThemedView className={"px-6"}>
        <ThemedView className="flex-col mb-4">
          <ThemedText className="mb-4" type="title">Recent Sessions</ThemedText>
          <ThemedView style={{ borderColor: colors.border }} className={"border items-center rounded-lg border-solid p-12 py-[40px]"}>
            <ThemedText type="subtitle">No sessions</ThemedText>
            <ThemedText secondary = {true} className="text-center mb-8">Start a session to simulate 18 holes of make or break putts.</ThemedText>
            <ThemedButton onPress={() => setNewSession(true)} title="New session"></ThemedButton>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}