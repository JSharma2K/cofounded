import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, Alert } from 'react-native';
import { signOut } from '../../lib/api/auth';
import { colors, typography } from '../../utils/theme';

export default function TabsLayout() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
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
        <Tabs screenOptions={{
          headerShown: true,
          headerRight: () => <LogoutButton />,
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: typography.fontFamilies.ui,
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 100,
            paddingBottom: 16,
            paddingTop: 16,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontFamily: typography.fontFamilies.ui,
            fontSize: 14,
            fontWeight: '500',
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
        }}>
          <Tabs.Screen
            name="feed"
            options={{
              title: 'Feed',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cards" size={size + 2} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="matches"
            options={{
              title: 'Connections',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="handshake" size={size + 2} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="likes"
            options={{
              title: 'Likes',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="thumb-up" size={size + 2} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="account" size={size + 2} color={color} />
              ),
            }}
          />
      <Tabs.Screen
        name="chat/[matchId]"
        options={{
          href: null, // Hide from tab bar
          title: 'Chat',
        }}
      />
    </Tabs>
  );
}

