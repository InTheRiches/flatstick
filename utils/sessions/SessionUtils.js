function adaptFullRoundSession(session) {
    if (session.type !== "full-round") return session;

    //each hole within holes has a puttdata array. That putt data array should be exposed, so that is an array of putt data
    const putts = session.holes.map(hole => {
        return hole.puttData || {};
    });

    let filteredHoles = 0;
    session.holes.forEach(hole => {
        if (!isHolePuttDataInvalid(hole.puttData)) filteredHoles++;
    });

    // turn a full round session into the format of the others
    return {
        id: session.id,
        date: session.date,
        type: session.type,
        timestamp: session.timestamp,
        filteredHoles,
        holes: session.tee.number_of_holes,
        putter: session.putter,
        grip: session.grip,
        putts: putts,
        score: session.score,
        ...session.puttStats
    }
}

function isHolePuttDataInvalid(puttData) {
    return puttData.distance === -1 ||
        (Object.keys(puttData.point).length < 1 && puttData.distance !== 0 && !puttData.center && puttData.largeMiss.distance === -1)
}

export {adaptFullRoundSession}