import { Platform, Pressable, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { isNotificationSoundEnabled } from '@/src/lib/notificationSettings';

type Props = {
  label: string;
};

export default function Alert({ label }: Props) {
  const handleTestNotification = async () => {
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

    Notifications.scheduleNotificationAsync({
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
  };

  return (
    <View style={{ height: 180, width: 180, borderWidth: 1 }}>
      <Text>Alert</Text>
      <Pressable onPress={handleTestNotification}>
        <Text>Test notification</Text>
      </Pressable>
    </View>
  );
}
