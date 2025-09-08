function isHolePuttDataInvalid(puttData) {
    return puttData.distance === -1 ||
        (Object.keys(puttData.point).length < 1 && puttData.distance !== 0 && !puttData.center && puttData.largeMiss.distance === -1)
}

export {isHolePuttDataInvalid}