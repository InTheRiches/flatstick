export const PUTTING_GREEN_WIDTH_FEET = 30;
export const SCHEMA_VERSION = 2; // Increment this when making breaking changes to the data schema

// TODO add an extreme mode with like left right left breaks, as well as extreme vs slight breaks
export const BREAKS = ["Left to Right", "Right to Left", "Straight"];
export const SLOPES = ["Downhill", "Neutral", "Uphill"];

export const GREEN_MAPS = {
    "0,0": require("@/assets/images/greens/rightForward.png"),
    "0,1": require("@/assets/images/greens/right.png"),
    "0,2": require("@/assets/images/greens/backRight.png"),
    "1,0": require("@/assets/images/greens/leftForward.png"),
    "1,1": require("@/assets/images/greens/left.png"),
    "1,2": require("@/assets/images/greens/backLeft.png"),
    "2,0": require("@/assets/images/greens/forward.png"),
    "2,1": require("@/assets/images/greens/neutral.png"),
    "2,2": require("@/assets/images/greens/back.png"),
};