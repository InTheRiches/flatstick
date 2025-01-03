const convertUnits = (value, fromUnits, toUnits) => {
    // Add logic for unit conversion
    return value;
};

const calculateAngle = (x, y) => Math.atan2(y, x) * (180 / Math.PI);

const roundTo = (value, decimals) => Number(Math.round(value + "e" + decimals) + "e-" + decimals);

export { convertUnits, calculateAngle, roundTo };