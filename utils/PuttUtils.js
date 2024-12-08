const normalizeVector = (vector) => {
    const length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
    return [vector[0] / length, vector[1] / length];
  };

const getLargeMissPoint = (largeMissBy, largeMissDistance) => {
const [dirX, dirY] = normalizeVector(largeMissBy);
const missedX = dirX * largeMissDistance;
const missedY = dirY * largeMissDistance;
return {x: missedX, y: missedY};
};

export { normalizeVector, getLargeMissPoint };