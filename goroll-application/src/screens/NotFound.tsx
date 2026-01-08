import { Text } from '@react-navigation/elements';
import { StyleSheet, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStacksParamList } from '../navigation/NavigationTypes';

export function NotFound() {
    const navigation =
      useNavigation<NativeStackNavigationProp<RootStacksParamList>>();

  return (
    <View style={styles.container}>
      <Text>404</Text>
      <Button title="Go to Sign In" onPress={() => navigation.navigate('SignIn')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});
