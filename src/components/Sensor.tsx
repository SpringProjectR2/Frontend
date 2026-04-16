import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { useSensorData } from '@/src/lib/sensorData';
import { useSocketStatus } from '@/src/lib/socketService';

type Props = {
  label: string;
};

export default function Sensor({ label }: Props) {
  const data = useSensorData(label);
  const socketStatus = useSocketStatus();

  const currentValue = data[data.length - 1]?.value ?? 0;
  const isStale = socketStatus.state === 'stale' || socketStatus.state === 'error';

  return (
    <Link href={{ pathname: '/sensor', params: { label } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open details for ${label}`}
        style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
      >
        <View style={{ height: 180 }}>
          <View style={{ paddingHorizontal: 8, paddingTop: 4, paddingBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{label}</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              {currentValue.toFixed(1)} °C
            </Text>
            {isStale ? (
              <Text style={{ fontSize: 12, color: '#a64d00', marginTop: 2 }}>
                Stale: waiting for reconnect
              </Text>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <CartesianChart
              data={data}
              xKey="timestamp"
              yKeys={["value"]}
            >
              {({ points }) => (
                <Line points={points.value} color="red" strokeWidth={3} />
              )}
            </CartesianChart>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
