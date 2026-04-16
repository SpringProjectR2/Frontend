import { View } from "react-native";

import Sensor from "@/src/components/Sensor"

export default function Sensors() {
  return (
    <View style={{ flex: 1 }}>
      <Sensor label="Sensor1"></Sensor>
      <Sensor label="Sensor2"></Sensor>
    </View>
  );
}
