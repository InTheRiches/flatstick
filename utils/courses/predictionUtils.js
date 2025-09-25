import {getElevationBilinear, getPuttGradient} from "./gpsStatsEngine";
import {FEET_PER_METER, METERS_PER_DEGREE} from "../../constants/Constants";

/**
 * Predicts the putt's break in inches based on green topography.
 * @param lidarGrid
 * @param {{latitude: number, longitude: number}} tap - The ball's position.
 * @param {{latitude: number, longitude: number}} pin - The pin's position.
 * @param {number} stimp - The Stimp rating of the green (e.g., 10 for medium speed).
 * @returns {Promise<object>} An object with putt details, including the break in inches.
 */
export async function predictPutt(lidarGrid, tap, pin, stimp = 10) {
    const grid = lidarGrid;

    // --- 1. Calculate Distances and Elevations ---
    const dx_deg = pin.longitude - tap.longitude;
    const dy_deg = pin.latitude - tap.latitude;
    const lat_rad_mid = ((tap.latitude + pin.latitude) / 2) * (Math.PI / 180);

    // Convert degree distances to meters
    const dx_m = dx_deg * METERS_PER_DEGREE * Math.cos(lat_rad_mid);
    const dy_m = dy_deg * METERS_PER_DEGREE;

    const flatDistMeters = Math.sqrt(dx_m**2 + dy_m**2);
    const flatDistFeet = flatDistMeters * FEET_PER_METER;

    const zTap = getElevationBilinear(tap.longitude, tap.latitude, grid);
    const zPin = getElevationBilinear(pin.longitude, pin.latitude, grid);
    const dz_m = zPin - zTap; // Elevation change in meters

    // --- 2. Calculate Side Slope at Midpoint ---
    const mid = {
        x: (tap.longitude + pin.longitude) / 2,
        y: (tap.latitude + pin.latitude) / 2
    };
    const grad = getPuttGradient(mid.x, mid.y, grid); // grad is {dx, dy} slope in m/m

    // Normalized putt direction vector
    const puttDir = { x: dx_m / flatDistMeters, y: dy_m / flatDistMeters };

    // The side slope is the component of the gradient perpendicular to the putt line.
    // This is found using the dot product.
    const sideSlope = grad.dx * -puttDir.y + grad.dy * puttDir.x;
    const sideSlopePercent = sideSlope * 100;

    // --- 3. Calculate Break in Inches ---
    // This is a well-established approximation formula.
    // The constant adjusts for a standard green speed (e.g., Stimp 10).
    const GREEN_SPEED_CONSTANT = 0.15; // Adjust this based on real-world results
    const breakInches = sideSlopePercent * flatDistFeet * (stimp / 10) * GREEN_SPEED_CONSTANT;

    // --- 4. Determine Break Direction ---
    // A positive sideSlope means the ground is higher on the right, so the ball breaks left.
    const breakDirection = breakInches > 0 ? 'left' : 'right';

    return {
        puttDistanceFeet: flatDistFeet,
        elevationChangeInches: dz_m * 39.3701,
        slopePercent: (dz_m / flatDistMeters) * 100,
        sideSlopePercent: Math.abs(sideSlopePercent),
        aimingBreakInches: Math.abs(breakInches),
        breakDirection: breakDirection,
    };
}
