import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { useFont } from "@shopify/react-native-skia";
import { CartesianChart, Line } from "victory-native";
import { useSensorData } from "@/src/lib/sensorData";
import { useSocketStatus } from "@/src/lib/socketService";

const formatTimeLabel = (time: string) => {
  const date = new Date(time);
  if (!Number.isFinite(date.getTime())) {
    return time;
  }

  return date.toISOString().slice(11, 19);
};

export default function Sensor() {
  const { label, metric } = useLocalSearchParams<{
    label?: string | string[];
    metric?: string | string[];
  }>();
  const sensorLabel = Array.isArray(label) ? label[0] : label ?? "Sensor";
  const metricParam = Array.isArray(metric) ? metric[0] : metric;
  const selectedMetric = metricParam === "humidity" ? "humidity" : "temperature";
  const metricLabel = selectedMetric === "humidity" ? "Humidity" : "Temperature";
  const metricUnit = selectedMetric === "humidity" ? "%" : "°C";
  const metricColor = selectedMetric === "humidity" ? "#1f77b4" : "red";
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
        {sensorLabel} {metricLabel} details
      </Text>
      {isStale ? (
        <Text style={{ color: "#a64d00", marginBottom: 8 }}>
          Stale: displaying last known values while reconnecting.
        </Text>
      ) : null}
      <View style={{ height: 300 }}>
        <CartesianChart
          data={data}
          xKey="time"
          yKeys={[selectedMetric]}
          axisOptions={{
            font,
            formatXLabel: (label) => formatTimeLabel(String(label)),
          }}
        >
          {({ points }) => {
            if (selectedMetric === "humidity") {
              return <Line points={points.humidity} color={metricColor} strokeWidth={3} />;
            }

            return <Line points={points.temperature} color={metricColor} strokeWidth={3} />;
          }}
        </CartesianChart>
      </View>

      <View style={{ marginTop: 16, borderWidth: 1, borderColor: "#ddd" }}>
        <View style={{ flexDirection: "row", backgroundColor: "#f6f6f6" }}>
          <Text style={{ flex: 1, padding: 8, fontWeight: "600" }}>Time</Text>
          <Text style={{ width: 100, padding: 8, fontWeight: "600" }}>
            {metricLabel}
          </Text>
        </View>
        {[...data].reverse().map((point, index) => (
          <View
            key={`${point.time}-${index}`}
            style={{
              flexDirection: "row",
              borderTopWidth: 1,
              borderTopColor: "#eee",
            }}
          >
            <Text style={{ flex: 1, padding: 8 }}>
              {formatTimeLabel(point.time)}
            </Text>
            <Text style={{ width: 100, padding: 8 }}>
              {(selectedMetric === "humidity" ? point.humidity : point.temperature).toFixed(1)} {metricUnit}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
