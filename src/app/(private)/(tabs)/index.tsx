import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { removeAlertActivity, useAlertActivity } from "@/src/lib/alertActivity";

export default function Index() {
  const activityItems = useAlertActivity();
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [activityContentHeight, setActivityContentHeight] = useState(0);
  const collapsedActivityHeight = 220;
  const hasHiddenActivity =
    !showAllActivity && activityContentHeight > collapsedActivityHeight + 1;

  const formatActivityDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const datePart = date.toLocaleDateString();
    const timePart = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${datePart} ${timePart}`;
  };

  const renderWarningIcon = () => {
    if (Platform.OS === "ios") {
      return (
        <SymbolView
          name="exclamationmark.triangle.fill"
          size={16}
          tintColor="#d46a00"
          type="hierarchical"
        />
      );
    }

    return <MaterialIcons name="warning-amber" size={16} color="#d46a00" />;
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 24,
        paddingBottom: 24,
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
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          Activity ({activityItems.length})
        </Text>
        {activityItems.length === 0 ? (
          <Text style={{ color: "#444444" }}>No activity yet</Text>
        ) : (
          <>
            <View
              style={{
                maxHeight: showAllActivity ? undefined : collapsedActivityHeight,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <View
                style={{ gap: 8, paddingRight: 4 }}
                onLayout={({ nativeEvent }) => {
                  setActivityContentHeight(nativeEvent.layout.height);
                }}
              >
                {activityItems.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      borderWidth: 1,
                      borderColor: "#eeeeee",
                      borderRadius: 8,
                      padding: 8,
                      gap: 4,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {renderWarningIcon()}
                      <Text style={{ fontWeight: "600" }}>Test alert</Text>
                    </View>
                    <Text style={{ color: "#4a4a4a", fontSize: 12 }}>
                      more info more info more info more info more info more info more info
                    </Text>
                    <Text style={{ color: "#666666", fontSize: 12 }}>
                      {formatActivityDateTime(item.createdAt)}
                    </Text>
                    <Pressable
                      onPress={() => removeAlertActivity(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Check alert"
                      style={({ pressed }) => ({
                        alignSelf: "flex-start",
                        marginTop: 4,
                        paddingHorizontal: 10,
                        minHeight: 30,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#d9d9d9",
                        backgroundColor: pressed ? "#f2f2f2" : "#ffffff",
                        justifyContent: "center",
                      })}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#222222" }}>
                        Check alert
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
              {hasHiddenActivity ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 36,
                    justifyContent: "flex-end",
                  }}
                >
                  <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0)" }} />
                  <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />
                  <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.45)" }} />
                  <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.75)" }} />
                </View>
              ) : null}
            </View>
            {hasHiddenActivity ? (
              <Pressable
                onPress={() => setShowAllActivity(true)}
                accessibilityRole="button"
                accessibilityLabel="Show all activity"
                style={({ pressed }) => ({
                  marginTop: 6,
                  alignSelf: "center",
                  paddingHorizontal: 10,
                  minHeight: 30,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#d9d9d9",
                  backgroundColor: pressed ? "#f2f2f2" : "#ffffff",
                  justifyContent: "center",
                })}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#222222" }}>
                  Show all activity
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
}
