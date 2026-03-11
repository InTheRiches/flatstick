// SelectCourseDetailsModal.tsx
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import React, { useMemo } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

import { Button } from "@/components/ui/Button"
import { Text } from "@/components/ui/Text"
import { LiveHoleState } from "@/models/round.live.types"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { BottomSheetModalFactory } from "../../modals/BottomSheetFactory"
import Scorecard from "../Scorecard/Scorecard"
import { ScorecardHole } from "../Scorecard/types"
import { CourseSelectionDetails } from "./SelectCourseDetailsModal"

interface SubmitRoundModalProps {
    reference: React.RefObject<BottomSheetModal | null>
    course: CourseSelectionDetails | null
    onSubmit: () => void
    holes: LiveHoleState[]
}

export default function SubmitRoundModal({reference, course, onSubmit, holes}: SubmitRoundModalProps) {
    const {theme, themed} = useAppTheme()

    const scorecardData = useMemo(() => {
        if (!holes || Object.keys(holes).length === 0) return undefined;
        const data = [];
        for (let i = 1; i <= Object.keys(holes).length; i++) {
            const hole = holes[i];
            data.push({
                par: hole?.par ?? 4,
                score: hole?.score ?? -1,
            } as ScorecardHole);
        }
        return data;
    }, [holes]);

    return (
        <BottomSheetModalFactory
            reference={reference}
            enablePanDownToClose={true}
            handleIndicatorStyle={{backgroundColor: theme.colors.text}}
        >
            <Text text={"Submit Round?"} style={themed($titleText)} />

            <View style={{backgroundColor: theme.colors.backgrounds.default, borderWidth: 1, borderBottomWidth: 0, borderColor: theme.colors.border, borderTopLeftRadius: 16, borderTopRightRadius: 16, marginTop: 16, flexDirection: "row"}}>
                <View style={{flexDirection: "column", flex: 1, borderRightWidth: 1, borderColor: theme.colors.border, paddingBottom: 8, paddingTop: 6, paddingLeft: 12,}}>
                    <Text style={{fontSize: 13, textAlign: "left", fontWeight: 700, color: theme.colors.textDim,}}>COURSE</Text>
                    <Text style={{fontSize: 20, color: theme.colors.text, fontWeight: "bold", flexShrink: 1}} text={course?.selectedCourse.courseName ?? course?.club.clubName}></Text>
                </View>
                {course?.selectedTee && (
                    <View style={{flexDirection: "column", flex: 0.4, paddingBottom: 8, paddingTop: 6, paddingLeft: 12,}}>
                        <Text style={{fontSize: 13, textAlign: "left", fontWeight: 700, color: theme.colors.textDim}}>TEE</Text>
                        <Text style={{fontSize: 20, color: theme.colors.text, fontWeight: "bold", flexShrink: 1}} text={course?.selectedTee.name.charAt(0).toUpperCase() + course?.selectedTee.name.slice(1).toLowerCase()}></Text>
                    </View>
                )}
            </View>
            <Scorecard holes={scorecardData} topMargin={false} roundedTop={false}/>

            <View style={$actionRow}>
                <Button text={"Cancel"} preset={"secondary"} onPress={() => reference.current?.dismiss()} style={themed($secondaryButton)} />
                <Button text={`Submit`} preset={"default"} style={themed($secondaryButton)} onPress={onSubmit} />
            </View>
        </BottomSheetModalFactory>
     )
}

const $titleText: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center"
})

const $cardContainer: ThemedStyle<ViewStyle> = (theme) => ({
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.backgrounds.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    alignSelf: 'center',
    marginTop: 16,
})

const $cardTitle: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'left',
})

const $cardText: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'left',
    marginTop: -4
})

const $actionRow: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    flex: 1,
    gap: 19
}

const $secondaryButton: ThemedStyle<ViewStyle> = (theme) => ({
    flex: 1,
    flexBasis: 0,
})
