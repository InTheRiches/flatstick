import {roundTo} from "./roundTo";
import {FEET_PER_METER} from "@/constants/Constants";

const convertToMeters = (value) => {
    return roundTo(value * 0.3048, 1);
}

const convertToFeet = (value) => {
    return roundTo(value * FEET_PER_METER, 1);
}

const convertUnits = (value, unitFrom, unitTo) => {
    if (unitFrom === 0 && unitTo === 1) {
        return convertToMeters(value);
    } else if (unitFrom === 1 && unitTo === 0) {
        return convertToFeet(value);
    } else {
        return value;
    }
}

export {convertToMeters, convertToFeet, convertUnits};