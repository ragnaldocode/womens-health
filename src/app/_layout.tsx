import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from '@/hooks/use-app-data';
import { useTheme } from '@/theme';

function RootNavigator() {
  const theme = useTheme();

  return (
    <>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Preventiva' }} />
        <Stack.Screen name="lista" options={{ title: 'Exames preventivos' }} />
        <Stack.Screen name="exame/[id]" options={{ title: 'Detalhes' }} />
        <Stack.Screen
          name="onboarding"
          options={{ title: 'Sua data de nascimento', gestureEnabled: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <RootNavigator />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
