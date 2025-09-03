import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

/**
 * A component to display putt prediction data in a clean, readable card.
 * @param {{ prediction: object | null }} props
 * - prediction: The result object from the predictPutt function.
 */
const PuttPrediction = ({ prediction }) => {
    // Show a loading indicator if the prediction is not yet available.
    if (!prediction) {
        return (
            <></>
        );
    }

    // Determine elevation label and style
    const isUphill = prediction.elevationChangeInches >= 0;
    const elevationLabel = isUphill ? 'Uphill' : 'Downhill';
    const elevationStyle = isUphill ? styles.uphillText : styles.downhillText;

    // Determine break direction icon
    const breakIcon = prediction.breakDirection === 'left' ? '⬅️' : '➡️';

    return (
        <View style={styles.container}>
            {/* Main Aiming Instruction */}
            <Text style={styles.title}>Putt Break Prediction</Text>
            <View style={styles.aimingContainer}>
                <Text style={styles.aimingText}>
                    <Text style={styles.aimingValue}>{prediction.aimingBreakInches.toFixed(1)}</Text>
                    <Text style={styles.aimingUnit}> inches {prediction.breakDirection}</Text>
                </Text>
            </View>

            <View style={styles.separator} />

            {/* Secondary Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>📏 Distance</Text>
                    <Text style={styles.statValue}>{prediction.puttDistanceFeet.toFixed(1)} ft</Text>
                </View>

                <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>⛰️ Elevation</Text>
                    <Text style={[styles.statValue, elevationStyle]}>
                        {isUphill ? '+' : ''}{prediction.elevationChangeInches.toFixed(1)} in ({elevationLabel})
                    </Text>
                </View>
            </View>
        </View>
    );
};

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 12,
        marginTop: -16,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        // Shadow for Android
        elevation: 5,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
        textAlign: 'center',
    },
    aimingContainer: {
        alignItems: 'center',
        marginBottom: 4,
        marginTop: -8
    },
    aimingText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#111',
    },
    aimingValue: {
        color: '#006400', // Dark Green
    },
    aimingUnit: {
        fontSize: 24,
        fontWeight: '500',
        color: '#555',
    },
    directionText: {
        fontSize: 22,
        fontWeight: '600',
        marginTop: 5,
    },
    separator: {
        height: 1,
        backgroundColor: '#EAEAEA',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
    },
    statBlock: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        color: '#777',
        marginBottom: 5,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    uphillText: {
        color: '#D44C4C', // Red for uphill (harder)
    },
    downhillText: {
        color: '#4A90E2', // Blue for downhill (faster)
    },
});

export default PuttPrediction;