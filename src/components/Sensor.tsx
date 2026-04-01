import { Link } from 'expo-router';
import { View } from 'react-native';

type Props = {
  label: string;
};

export default function Sensor({ label }: Props) {
  return (
    <View>
        <Link href="/sensor">{label}</Link>
    </View>
  );
}
