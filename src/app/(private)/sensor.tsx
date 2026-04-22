import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { useFont } from "@shopify/react-native-skia";
import { CartesianChart, Line } from "victory-native";
import { useSensorData } from "@/src/lib/sensorData";
import { useSocketStatus } from "@/src/lib/socketService";

const formatUnixTimeLabel = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toISOString().slice(11, 19);
};

export default function Sensor() {
  const { label } = useLocalSearchParams<{ label?: string | string[] }>();
  const sensorLabel = Array.isArray(label) ? label[0] : label ?? "Sensor";
  const data = useSensorData(sensorLabel);
  const socketStatus = useSocketStatus();
  const isStale = socketStatus.state === "stale" || socketStatus.state === "error";

  const font = useFont(
    require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    12,
  );

  if (!font) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}>
        {sensorLabel} details
      </Text>
      {isStale ? (
        <Text style={{ color: "#a64d00", marginBottom: 8 }}>
          Stale: displaying last known values while reconnecting.
        </Text>
      ) : null}
      <View style={{ height: 300 }}>
        <CartesianChart
          data={data}
          xKey="timestamp"
          yKeys={["value"]}
          axisOptions={{
            font,
            formatXLabel: (label) => formatUnixTimeLabel(Number(label)),
          }}
        >
          {({ points }) => (
            <Line points={points.value} color="red" strokeWidth={3} />
          )}
        </CartesianChart>
      </View>

      <View style={{ marginTop: 16, borderWidth: 1, borderColor: "#ddd" }}>
        <View style={{ flexDirection: "row", backgroundColor: "#f6f6f6" }}>
          <Text style={{ flex: 1, padding: 8, fontWeight: "600" }}>Time</Text>
          <Text style={{ width: 100, padding: 8, fontWeight: "600" }}>Value</Text>
        </View>
        {data.map((point, index) => (
          <View
            key={`${point.timestamp}-${index}`}
            style={{
              flexDirection: "row",
              borderTopWidth: 1,
              borderTopColor: "#eee",
            }}
          >
            <Text style={{ flex: 1, padding: 8 }}>
              {formatUnixTimeLabel(point.timestamp)}
            </Text>
            <Text style={{ width: 100, padding: 8 }}>{point.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
