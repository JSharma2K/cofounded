import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

export function useFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'NeueMontreal-Regular': require('../../assets/fonts/NeueMontreal-Regular.otf'),
          'NeueMontreal-Medium': require('../../assets/fonts/NeueMontreal-Medium.otf'),
          'NeueMontreal-Bold': require('../../assets/fonts/NeueMontreal-Bold.otf'),
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

