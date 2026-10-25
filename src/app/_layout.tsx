import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from '@/hooks/use-app-data';
import { fonts, useTheme } from '@/theme';

function RootNavigator() {
  const theme = useTheme();

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.primaryDark,
          headerTitleStyle: { fontFamily: fonts.display, fontWeight: '600', color: theme.colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Preventiva', headerShown: false }} />
        <Stack.Screen name="lista" options={{ title: 'Exames preventivos', headerTitle: '' }} />
        <Stack.Screen name="exame/[id]" options={{ title: 'Detalhes', headerTitle: '' }} />
        <Stack.Screen
          name="onboarding"
          options={{ title: 'Sua data de nascimento', headerTitle: '', gestureEnabled: false }}
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
