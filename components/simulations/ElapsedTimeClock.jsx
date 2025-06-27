import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import FontText from "../general/FontText";

const ElapsedTimeClock = ({ startTime, styles }) => {
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
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <FontText style={styles}>{formatTime(elapsedTime)}</FontText>
  );
};

export default ElapsedTimeClock;
