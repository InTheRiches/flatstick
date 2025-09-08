export const createNullTees = (num) => {
    const holes = [];
    for (let i = 0; i < num; i++) {
        holes.push({
            id: i,
            name: `Tee ${i + 1}`,
            par: 0,
            yardage: 0, // Example distance
            handicap: 0, // Example handicap
            slope: 0, // Example slope
            rating: 0, // Example rating
        });
    }
    return {holes};
}