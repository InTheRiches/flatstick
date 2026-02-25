// SelectCourseDetailsModal.tsx
import React, {useImperativeHandle, useMemo, useState} from "react"
import {BottomSheetModal} from "@gorhom/bottom-sheet"
import {View, TextStyle, ViewStyle} from "react-native"

import {BottomSheetModalFactory} from "../../modals/BottomSheetFactory"
import {Text} from "@/components/ui/Text"
import {Button} from "@/components/ui/Button"
import {useAppTheme} from "@/theme/context"
import {$styles} from "@/theme/styles"
import DropdownPicker from "@/components/ui/DropdownPicker"
import type {ClubResult, ClubCourse, TeeSet} from "@/services/courses/courseSearching"

interface SelectCourseDetailsModalProps {
    reference: React.RefObject<SelectCourseDetailsModalReference | null>
    onConfirm?: (details: CourseSelectionDetails) => void
}

export interface SelectCourseDetailsModalReference {
    open: () => void
    close: () => void
    setClub: (club: ClubResult | null) => void
}

export type CourseSelectionDetails = {
    club: ClubResult
    selectedCourse: ClubCourse
    gender: "male" | "female"
    selectedTee: TeeSet
    numberOfHoles: 18 | 9
    nineHolesSide?: "front" | "back" // only if numberOfHoles === 9
}

export default function SelectCourseDetailsModal({reference, onConfirm}: SelectCourseDetailsModalProps) {
    const {theme} = useAppTheme()
    const innerRef = React.useRef<BottomSheetModal>(null)

    const [club, setClub] = useState<ClubResult | null>(null)
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
    const [gender, setGender] = useState<"male" | "female">("male")
    const [selectedTeeName, setSelectedTeeName] = useState<string | null>(null)
    const [numberOfHoles, setNumberOfHoles] = useState<"18" | "9">("18")
    const [nineHolesSide, setNineHolesSide] = useState<"front" | "back">("front")

    useImperativeHandle(reference, () => ({
        open: () => {
            innerRef.current?.present()
        },
        close: () => {
            innerRef.current?.dismiss()
        },
        setClub: (input) => {
            if (!input) return

            setClub(input)

            // Auto-select first course if only one exists
            if (input.courses.length === 1) {
                setSelectedCourseId(input.courses[0].id)
            } else {
                setSelectedCourseId(input.courses[0].id) // default to first
            }

            // Reset other selections
            setGender("male")
            setSelectedTeeName(null)
            setNumberOfHoles("18")
            setNineHolesSide("front")
        },
    } as SelectCourseDetailsModalReference))

    // Computed values
    const selectedCourse = useMemo(() => {
        if (!club || !selectedCourseId) return null
        return club.courses.find(c => c.id === selectedCourseId) ?? null
    }, [club, selectedCourseId])

    const availableTees = useMemo(() => {
        if (!selectedCourse) return []
        return selectedCourse.tees[gender] ?? []
    }, [selectedCourse, gender])

    const selectedTee = useMemo(() => {
        if (!selectedTeeName || !availableTees.length) return null
        return availableTees.find(t => t.name === selectedTeeName) ?? null
    }, [availableTees, selectedTeeName])

    // Auto-select first tee when gender or course changes
    React.useEffect(() => {
        if (availableTees.length > 0) {
            setSelectedTeeName(availableTees[0].name)
        } else {
            setSelectedTeeName(null)
        }
    }, [availableTees])

    // Dropdown options
    const courseOptions = useMemo(() => {
        if (!club) return []
        return club.courses.map(c => ({
            value: c.id,
            label: c.courseName || "Main Course",
            description: undefined,
        }))
    }, [club])

    const genderOptions = [
        {value: "male", label: "Men's Tees"},
        {value: "female", label: "Women's Tees"},
    ]

    const teeOptions = useMemo(() => {
        return availableTees.map(tee => ({
            value: tee.name,
            label: tee.name || "Unnamed Tee",
            description: `${tee.yards} yds • Rating: ${tee.rating} • Slope: ${tee.slope}`,
        }))
    }, [availableTees])

    const holesOptions = [
        {value: "18", label: "18 Holes"},
        {value: "9", label: "9 Holes"},
    ]

    const sideOptions = [
        {value: "front", label: "Front 9"},
        {value: "back", label: "Back 9"},
    ]

    const isSaveEnabled = !!(club && selectedCourse && (selectedTee || teeOptions.length == 0))

    const onPressSave = async () => {
        if (!isSaveEnabled || !club || !selectedCourse || !selectedTee) return

        const details: CourseSelectionDetails = {
            club,
            selectedCourse,
            gender,
            selectedTee,
            numberOfHoles: numberOfHoles === "18" ? 18 : 9,
            nineHolesSide: numberOfHoles === "9" ? nineHolesSide : undefined,
        }

        onConfirm?.(details)
        innerRef.current?.dismiss()
    }

    const showCourseSelector = club && club.courses.length > 1

    return (
        <BottomSheetModalFactory
            reference={innerRef}
            enablePanDownToClose={true}
            handleIndicatorStyle={{backgroundColor: theme.colors.text}}
        >
            {!club ? (
                <Text text="No club selected." style={$helperDisabled}/>
            ) : (
                <View>
                    <Text text={club.clubName} style={$clubName}/>
                    {club.distanceMi != null && (
                        <Text text={`${club.distanceMi} mi away`} style={$distance}/>
                    )}

                    {showCourseSelector && (
                        <View style={$section}>
                            <DropdownPicker
                                label="Course"
                                options={courseOptions}
                                value={selectedCourseId}
                                onChange={(v) => setSelectedCourseId(v)}
                            />
                        </View>
                    )}

                    <View style={$section}>
                        <DropdownPicker
                            label="Gender"
                            options={genderOptions}
                            value={gender}
                            onChange={(v) => setGender(v as "male" | "female")}
                        />
                    </View>

                    {teeOptions.length > 0 ? (
                        <View style={$section}>
                            <DropdownPicker
                                label="Tee Box"
                                options={teeOptions}
                                value={selectedTeeName}
                                onChange={(v) => setSelectedTeeName(v)}
                            />
                        </View>
                    ) : (
                        <Text text={`No ${gender} tees known for this course.`} style={$helperDisabled}/>
                    )}

                    <View style={$section}>
                        <DropdownPicker
                            label="Number of Holes"
                            options={holesOptions}
                            value={numberOfHoles}
                            onChange={(v) => setNumberOfHoles(v as "18" | "9")}
                        />
                    </View>

                    {numberOfHoles === "9" && (
                        <View style={$section}>
                            <DropdownPicker
                                label="Which 9?"
                                options={sideOptions}
                                value={nineHolesSide}
                                onChange={(v) => setNineHolesSide(v as "front" | "back")}
                            />
                        </View>
                    )}

                    <Button
                        text="Confirm Selection"
                        onPress={onPressSave}
                        style={$button}
                        disabled={!isSaveEnabled}
                    />

                    {!isSaveEnabled && (
                        <Text text="Please select all required options" style={$helperDisabled}/>
                    )}
                </View>
            )}
        </BottomSheetModalFactory>
    )
}

const $section: ViewStyle = {
    marginTop: 12,
}

const $button: ViewStyle = {
    marginTop: 20,
    alignSelf: "center",
    paddingHorizontal: 48,
    paddingVertical: 8,
}

const $helperDisabled: TextStyle = {
    marginTop: 8,
    textAlign: "center",
    color: "#8b8b8b",
    fontSize: 12,
}

const $clubName: TextStyle = {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
}

const $distance: TextStyle = {
    fontSize: 14,
    textAlign: "center",
    color: "#8b8b8b",
    marginTop: -4,
}

