import { Text, View } from "react-native";

import Sensor from "@/src/components/Sensor"

export default function Sensors() {
  return (
    <View>
      <Text>Sensors</Text>
      <Sensor label="Sensor1"></Sensor>
      <Sensor label="Sensor2"></Sensor>
    </View>
  );
}
