function deepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

export {deepEqual};