# Frontend

## Get started
```bash
npm install
npx expo start
```

### Building development build

#### Windows
```bash
winget install OpenJS.NodeJS.LTS Microsoft.OpenJDK.17
```

- [Command line tools](https://developer.android.com/studio#command-line-tools-only)

Create new ENV variables
- `ANDROID_HOME "C:\Android\Sdk"`
- `ANDROID_SDK_ROOT "C:\Android\Sdk"`

Add to PATH 
- `C:\Android\Sdk\cmdline-tools\latest\bin`
- `C:\Android\Sdk\platform-tools`

```bash
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" "build-tools;35.0.0" "ndk;27.1.12297006"
sdkmanager --licenses
```

```bash
adb pair 192.168.1.67:43131
adb connect 192.168.1.67:42087
```

```bash
npm install
npx expo run:android
```

#### Linux

```bash
nvm install 24
```

Download
- https://developer.android.com/studio#command-line-tools-only
- https://developer.android.com/tools/releases/platform-tools

Unzip to 
- `~/Android/cmdline-tools/latest`
- `~/Android/platform-tools/`

Set envs (fish)
```bash
set -Ux ANDROID_HOME $HOME/Android
set -Ux ANDROID_SDK_ROOT $HOME/Android
set -U fish_user_paths $ANDROID_HOME/cmdline-tools/latest/bin $ANDROID_HOME/platform-tools $fish_user_paths
```

Accept licenses
```bash
sdkmanager --licenses
```

Pair and connect android device
```bash
adb pair 192.168.1.67:43131
adb connect 192.168.1.67:42087
```

Install node modules and run Expo DevClient
```bash
npm install
npx expo run:android
```