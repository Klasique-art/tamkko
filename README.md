# tamkko

This project is configured for a single native dependency setup pass, then one development build.

## What Was Installed From Docs

The Phase 1 docs package requirements are now installed, including:

- `expo-notifications`
- `expo-file-system`
- `expo-sharing`
- `expo-clipboard`
- `react-native-share`
- `react-native-progress`
- `react-native-country-picker-modal`
- `react-native-phone-number-input`
- `react-native-otp-textinput`
- `socket.io-client`
- `@flyerhq/react-native-chat-ui`
- `rn-emoji-keyboard`
- `react-hook-form`
- `zod`
- `zustand`

## Build Once Workflow

1. Install dependencies:
```bash
npm install
```

2. Create one development build per platform:
```bash
npm run build:dev:android
npm run build:dev:ios
```

3. Start Metro for the dev client:
```bash
npm run start
```

Notes:
- `start`, `android`, and `ios` scripts now use `--dev-client` by default.
- Use `npm run start:go` only when testing Expo Go-compatible features.

