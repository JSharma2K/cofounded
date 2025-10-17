import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

export function useFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'JosefinSans-ExtraLight': require('../../assets/fonts/static/JosefinSans-ExtraLight.ttf'),
          'JosefinSans-Light': require('../../assets/fonts/static/JosefinSans-Light.ttf'),
          'JosefinSans-Regular': require('../../assets/fonts/static/JosefinSans-Regular.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Error loading fonts:', error);
        // Fallback to system fonts if custom fonts fail to load
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  return fontsLoaded;
}

