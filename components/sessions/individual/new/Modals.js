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
    const {deleteSession} = useAppContext();

    return (
        <>
            <ShareSession shareSessionRef={shareSessionRef} session={session} />
            <ConfirmDelete
                confirmDeleteRef={confirmDeleteRef}
                cancel={() => confirmDeleteRef.current.dismiss()}
                onDelete={() => {
                    deleteSession(session.id).then(() => {
                        if (isRecap) navigation.navigate("(tabs)");
                        else navigation.goBack();
                    });
                }}
            />
            <InfoModal
                infoModalRef={infoModalRef}
                putter={session.putter}
                grip={session.grip}
            />
        </>
    );
}
