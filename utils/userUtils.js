export const getDefaultData = (firstName, lastName) => ({
    date: new Date().toISOString(),
    totalPutts: 0,
    sessions: 0,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    displayName: `${firstName.trim()} ${lastName.trim()}`,
    displayNameLower: `${firstName.trim()} ${lastName.trim()}`.toLowerCase(),
    strokesGained: 0,
    hasSeenRoundTutorial: false,
    hasSeenRealTutorial: false,
    hasPendingFriendRequests: false,
    friends: [],
    preferences: {
        countMishits: true,
        selectedPutter: 0,
        theme: 0,
        units: 0,
        reminders: false,
        selectedGrip: 0,
    }
});