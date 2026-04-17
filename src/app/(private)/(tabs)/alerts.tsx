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
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 24,
        gap: 12,
      }}
    >
      <View
        style={{
          width: "90%",
          borderWidth: 1,
          borderColor: "#d9d9d9",
          borderRadius: 10,
          padding: 12,
          backgroundColor: "#ffffff",
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Alerts</Text>
        <Alert label="Sensor1"></Alert>
        <Alert label="Sensor2"></Alert>
      </View>

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
          backgroundColor: "#000000",
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
