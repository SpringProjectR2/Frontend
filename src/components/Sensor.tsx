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

  const currentTemperature = data[data.length - 1]?.temperature ?? 0;
  const currentHumidity = data[data.length - 1]?.humidity ?? 0;
  const isStale = socketStatus.state === 'stale' || socketStatus.state === 'error';

  return (
    <View style={{ minHeight: 320 }}>
      <View style={{ paddingHorizontal: 8, paddingTop: 4, paddingBottom: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Temp: {currentTemperature.toFixed(1)} °C
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Humidity: {currentHumidity.toFixed(1)} %
        </Text>
        {isStale ? (
          <Text style={{ fontSize: 12, color: '#a64d00', marginTop: 2 }}>
            Stale: waiting for reconnect
          </Text>
        ) : null}
      </View>

      <Link href={{ pathname: '/sensor', params: { label, metric: 'temperature' } }} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open temperature details for ${label}`}
          style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
        >
          <View style={{ height: 120, paddingHorizontal: 8 }}>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Temperature</Text>
            <View style={{ flex: 1 }}>
              <CartesianChart
                data={data}
                xKey="time"
                yKeys={["temperature"]}
              >
                {({ points }) => (
                  <Line points={points.temperature} color="red" strokeWidth={3} />
                )}
              </CartesianChart>
            </View>
          </View>
        </Pressable>
      </Link>

      <Link href={{ pathname: '/sensor', params: { label, metric: 'humidity' } }} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open humidity details for ${label}`}
          style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
        >
          <View style={{ height: 120, paddingHorizontal: 8, paddingTop: 8 }}>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Humidity</Text>
            <View style={{ flex: 1 }}>
              <CartesianChart
                data={data}
                xKey="time"
                yKeys={["humidity"]}
              >
                {({ points }) => (
                  <Line points={points.humidity} color="#1f77b4" strokeWidth={3} />
                )}
              </CartesianChart>
            </View>
          </View>
        </Pressable>
      </Link>
    </View>
  );
}
