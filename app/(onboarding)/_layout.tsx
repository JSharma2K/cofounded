import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, Alert } from 'react-native';
import { signOut } from '../../lib/api/auth';
import { colors, typography } from '../../utils/theme';

export default function OnboardingLayout() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? Your onboarding progress will not be saved.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/signin');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const LogoutButton = () => (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 8, padding: 4 }}>
      <MaterialCommunityIcons name="exit-to-app" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerRight: () => <LogoutButton />,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: typography.fontFamilies.regular,
        },
      }}
    >
      <Stack.Screen name="step-1" options={{ title: 'About You' }} />
      <Stack.Screen name="step-2" options={{ title: 'Your Profile' }} />
      <Stack.Screen name="step-3" options={{ title: 'What You Seek' }} />
      <Stack.Screen 
        name="step-4" 
        options={({ route }) => {
          const role = route.params?.role;
          return {
            title: role === 'investor' ? 'Investor Profile' : 'Mentor Profile'
          };
        }} 
      />
    </Stack>
  );
}

