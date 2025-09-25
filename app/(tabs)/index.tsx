import { TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import './global.css';

export default function HomeScreen() {
  return (
      <SafeAreaView>
        <TextInput
          className='bg-pink-400'
          placeholder='Enter your name'
        />
        <TextInput
          className='bg-pink-400'
          placeholder='Enter your name'
        />
      </SafeAreaView>
  );
}
