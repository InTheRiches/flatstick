import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ElapsedTimeClock = ({ startTime }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prevElapsedTime) => prevElapsedTime + 1); // Increment by 1 each second
    }, 1000);

    // Initialize the elapsed time at mount
    const initialElapsedTime = Math.floor((Date.now() - startTime) / 1000);
    setElapsedTime(initialElapsedTime);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [startTime]);

  // Format elapsed time as hh:mm:ss
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Text style={styles.text}>Elapsed Time: {formatTime(elapsedTime)}</Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ElapsedTimeClock;
