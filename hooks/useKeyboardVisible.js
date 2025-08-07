import {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';

const useKeyboardVisible = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleKeyboardShow = () => setKeyboardVisible(true);
    const handleKeyboardHide = () => setKeyboardVisible(false);

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return isKeyboardVisible;
};

export default useKeyboardVisible;