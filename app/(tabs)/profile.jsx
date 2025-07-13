import React from 'react';
import { View, Text, Image, ScrollView, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const dummySessions = [
    { id: '1', date: 'July 12, 2025', strokesGained: '+2.3' },
    { id: '2', date: 'July 9, 2025', strokesGained: '+1.1' },
    { id: '3', date: 'July 5, 2025', strokesGained: '-0.8' },
];

const dummyFriends = [
    { id: '1', name: 'Jack P.', profileImage: 'https://via.placeholder.com/50' },
    { id: '2', name: 'Ava T.', profileImage: 'https://via.placeholder.com/50' },
    { id: '3', name: 'Noah B.', profileImage: 'https://via.placeholder.com/50' },
];

export default function ProfileScreen() {
    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/images/icon.png')} // Replace with your profile image
                    style={styles.profileImage}
                />
                <Text style={styles.name}>Hayden Williams</Text>
                <Text style={styles.strokesGained}>Strokes Gained: +1.7</Text>
                <Text style={styles.since}>Since April 2024</Text>
            </View>

            {/* Sessions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Sessions</Text>
                {dummySessions.map(session => (
                    <View key={session.id} style={styles.sessionItem}>
                        <Text style={styles.sessionText}>{session.date}</Text>
                        <Text style={styles.sessionGain}>{session.strokesGained}</Text>
                    </View>
                ))}
            </View>

            {/* Friends */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Friends</Text>
                <FlatList
                    data={dummyFriends}
                    horizontal
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.friendCard}>
                            <Image
                                source={{ uri: item.profileImage }}
                                style={styles.friendImage}
                            />
                            <Text style={styles.friendName}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 100, height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    strokesGained: {
        fontSize: 18,
        color: '#2ecc71',
        marginTop: 4,
    },
    since: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 2,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    sessionItem: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    sessionText: {
        fontSize: 16,
    },
    sessionGain: {
        fontSize: 16,
        color: '#2980b9',
        fontWeight: '500',
    },
    friendCard: {
        alignItems: 'center',
        marginRight: 15,
    },
    friendImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 5,
    },
    friendName: {
        fontSize: 14,
        textAlign: 'center',
    },
});
