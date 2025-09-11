import React from "react";
import ShareSession from "../ShareSession";
import {ConfirmDelete} from "../ConfirmDelete";
import InfoModal from "../InfoModal";
import {useAppContext} from "../../../../contexts/AppContext";

export default function Modals({
                                   session,
                                   shareSessionRef, confirmDeleteRef, infoModalRef,
                                   isRecap, navigation
                               }) {
    const {deleteSession, userData} = useAppContext();

    return (
        <>
            <ShareSession shareSessionRef={shareSessionRef} session={session} />
            <ConfirmDelete
                confirmDeleteRef={confirmDeleteRef}
                cancel={() => confirmDeleteRef.current.dismiss()}
                onDelete={() => {
                    console.log("deleting session", session.id);
                    deleteSession(session.id, userData.friends).then(() => {
                        if (isRecap) navigation.navigate("(tabs)");
                        else navigation.goBack();
                    }).catch((e) => {
                        console.error("Error deleting session:", e);
                    });
                }}
            />
            <InfoModal
                infoModalRef={infoModalRef}
                putter={session.player.putter}
                grip={session.player.grip}
                difficulty={session.meta.difficulty}
                mode={session.meta.mode}
            />
        </>
    );
}
