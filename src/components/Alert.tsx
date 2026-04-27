import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { addAlertActivity } from '@/src/lib/alertActivity';
import { isNotificationSoundEnabled, isNotificationsEnabled } from '@/src/lib/notificationSettings';

type Props = {
  label: string;
};

export default function Alert({ label }: Props) {
  const notificationsEnabled = isNotificationsEnabled();

  const handleTestNotification = async () => {
    if (!notificationsEnabled) {
      return;
    }

    const soundEnabled = isNotificationSoundEnabled();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts-sound-on', {
        name: 'Alerts (sound on)',
        importance: Notifications.AndroidImportance.MAX,
      });

      await Notifications.setNotificationChannelAsync('alerts-sound-off', {
        name: 'Alerts (sound off)',
        importance: Notifications.AndroidImportance.MAX,
        sound: null,
        vibrationPattern: [0],
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Alert trigger',
        body: `Alert for ${label} set off`,
        ...(Platform.OS === 'ios' ? { sound: soundEnabled } : {}),
        ...(Platform.OS === 'android'
          ? { channelId: soundEnabled ? 'alerts-sound-on' : 'alerts-sound-off' }
          : {}),
      },
      trigger: null,
    });

    addAlertActivity(label);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{label}</Text>
      </View>

      <Pressable
        onPress={handleTestNotification}
        accessibilityRole="button"
        accessibilityLabel={`Test notification for ${label}`}
        disabled={!notificationsEnabled}
        style={({ pressed }) => [
          styles.button,
          !notificationsEnabled && styles.buttonDisabled,
          pressed && notificationsEnabled && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>
          {notificationsEnabled ? 'Test notification' : 'Notifications disabled'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#ffffff',
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  button: {
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    backgroundColor: '#000000',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
