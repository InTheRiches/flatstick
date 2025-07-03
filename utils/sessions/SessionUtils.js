function adaptFullRoundSession(session) {
    if (session.type !== "full-round") return session;

    //each hole within holes has a puttdata array. That putt data array should be exposed, so that is an array of putt data
    const putts = session.holes.map(hole => {
        return hole.puttData;
    });

    // turn a full round session into the format of the others
    return {
        id: session.id,
        date: session.date,
        type: session.type,
        timestamp: session.timestamp,
        holes: session.tee.number_of_holes,
        putter: session.putter,
        grip: session.grip,
        putts: putts,
        ...session.puttStats
    }
}

export {adaptFullRoundSession}