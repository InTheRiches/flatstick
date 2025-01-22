import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import FontText from "../general/FontText";

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
    const formattedHours = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
    const formattedMinutes = minutes > 0 ? `${minutes.toString().padStart(2, '0')}:` : (hours > 0 ? '00:' : '');
    const formattedSeconds = secs.toString().padStart(2, '0');

    return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  };

  return (
    <FontText style={styles.text}>{formatTime(elapsedTime)}</FontText>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: 500
  },
});

export default ElapsedTimeClock;
