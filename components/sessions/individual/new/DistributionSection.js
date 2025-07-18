import React from "react";
import FontText from "../../../general/FontText";
import {MissDistributionDiagram} from "../../../simulations/recap";
import useColors from "../../../../hooks/useColors";

export default function DistributionSection({ session, numOfHoles, preferences }) {
    const colors = useColors();

    return (
        <>
            <FontText style={{ fontSize: 18, fontWeight: 600, color: colors.text.primary, marginTop: 16, marginBottom: 8 }}>
                1st Putt Distribution
            </FontText>
            <MissDistributionDiagram
                missData={session.missData}
                holes={numOfHoles}
                alone={true}
                units={preferences.units}
            />
        </>
    );
}