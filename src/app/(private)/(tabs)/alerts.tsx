import { Pressable, Text, View } from "react-native";
import Alert from "@/src/components/Alert";


export default function Alerts() {
  const handleAddAlert = () => {
    console.log("Add alert")
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Alerts</Text>
      <Alert label="Sensor1"></Alert>
      <Alert label="Sensor2"></Alert>

      <Pressable
        onPress={handleAddAlert}
        accessibilityRole="button"
        accessibilityLabel="Add alert"
        style={{
          position: "absolute",
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#0A84FF",
          justifyContent: "center",
          alignItems: "center",
          elevation: 4,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 32,
            lineHeight: 34,
            fontWeight: "600",
          }}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
}
