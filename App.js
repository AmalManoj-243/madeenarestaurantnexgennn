import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomToast from '@components/Toast/CustomToast';
import StackNavigator from '@navigation/StackNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
       <StackNavigator/>
      </SafeAreaProvider>
      <Toast config={CustomToast} />
    </NavigationContainer>
  );
}

