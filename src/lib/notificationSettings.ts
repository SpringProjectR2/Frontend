let notificationSoundEnabled = true;
let notificationsEnabled = true;

export function isNotificationSoundEnabled() {
  return notificationSoundEnabled;
}

export function setNotificationSoundEnabled(enabled: boolean) {
  notificationSoundEnabled = enabled;
}

export function isNotificationsEnabled() {
  return notificationsEnabled;
}

export function setNotificationsEnabled(enabled: boolean) {
  notificationsEnabled = enabled;
}