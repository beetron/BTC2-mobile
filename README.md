# bTC2 Mobile App (Frontend)

[![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo_SDK-55.0-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud_Messaging-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io_Client-4.8-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-NativeWind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

A modern iOS messaging app built with React Native and Expo, featuring real-time direct and group messaging, push notifications, image sharing, and comprehensive member management. This invite-only app requires an existing member's unique ID to join.
<br><br>
The backend API for bTC2 could be found at: https://github.com/beetron/BTC2-API<br>
Web version: https://github.com/beetron/BTC2-web

## Table of Contents

- [Features](#features)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Development Setup](#development-setup)
- [Architecture](#architecture)
  - [Key Features](#key-features)
  - [State Management](#state-management)
  - [Navigation](#navigation)
  - [Localization](#localization)
  - [Push Notifications](#push-notifications)
- [Development](#development)
- [Versioning](#versioning)
- [Building for Production](#building-for-production)

## Features

#### Current Features

- User authentication (signup/login/logout)
- Real-time messaging with socket.io
- Group conversations (create, rename, add/remove members, leave group)
- Friend management system (add, accept, reject, remove friends)
- Add friends by unique ID or by scanning their QR code
- Blocking and unblocking users
- Reporting users from direct and group conversations, with reason categories
- Profile customization (nickname, unique ID, profile image)
- Push notifications with badge count
- Image sharing in conversations (multi-select support)
- Full-screen image gallery with save-to-photo-library
- Link preview cards for URLs in messages
- Message management (clear conversation, view message history)
- Password recovery (forgot password/username)
- Account management (change password, update email, delete account)
- Localization with English and Japanese, switchable in-app
- Customizable app icons (multiple theme options)
- In-app EULA and legal documents
- Secure storage with expo-secure-store
- Responsive UI with NativeWind (TailwindCSS)
- Network-aware connectivity handling
- Message and profile image caching

#### Future Plans

- Voice messages
- Message reactions and replies
- Single message deletions

## Setup

### Prerequisites

- Node.js 20.19.4+ (required by React Native 0.83)
- Latest stable Xcode (for iOS development)
- EAS CLI (`npm install -g eas-cli`)
- iOS Simulator or physical device
- Firebase project with FCM configured
- Apple Developer Account (for testing on physical devices)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/beetron/btc2
cd btc2
```

2. Install dependencies:

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```bash
# Comment out for production builds (app will use EXPO_PUBLIC_API_URL)
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_URL=https://your-api-url.com
EXPO_PUBLIC_API_DEV_URL=http://192.168.1.2:3000
EXPO_PUBLIC_APP_VERSION=1.2.4
```

**Important:** For production builds, comment out `EXPO_PUBLIC_ENV=development` so the app uses `EXPO_PUBLIC_API_URL` instead of the development URL.

**Note:** `EXPO_PUBLIC_APP_VERSION` is what the Settings screen displays. It is separate from the version in `app.config.js` and must be updated alongside it — see [Versioning](#versioning).

Firebase credentials are not read from `.env`. The dev variant loads `./prebuild/dev-GoogleService-Info.plist`, and production reads the path from the `GOOGLESERVICE_INFO_PLIST` environment variable. The `prebuild/` directory is gitignored.

### Development Setup

This app **cannot run in Expo Go** — it uses native modules (React Native Firebase, expo-dev-client) that require a custom development build.

1. Build and install a development client on your simulator or device:

```bash
eas build --profile development --platform ios
```

2. Start the development server:

```bash
npx expo start
```

3. To build and run locally on a connected device instead (requires macOS + Xcode):

```bash
npm run ios:dev-device
```

## Architecture

### Key Features

#### Authentication & Account Management

- JWT-based authentication with secure token storage
- Silent token refresh with automatic retry on expiry, deduping concurrent refresh attempts
- Password recovery via email
- Username recovery functionality
- Account deletion with secure logout
- Email and password updates
- Protected route handling with expo-router

#### Real-time Communication

- Socket.io client integration with automatic reconnection
- Socket path derived from the API URL, so dev and production hosts work without a build-time flag
- Conversation-room broadcasts for direct and group chats
- Background connection management
- Image sharing with multi-select support
- Message caching for offline viewing
- Network-aware connectivity handling

#### Friend & Social Features

- Comprehensive friend management (add, accept, reject, remove)
- Friend request system with pending-count badges
- QR code generation and scanning for adding friends
- Blocking, unblocking, and reporting users
- Profile customization with images and nicknames
- Unique ID system for member identification

#### Group Conversations

- Create groups from a multi-select friend list
- Rename groups and manage membership
- Add and remove members, or leave a group
- Per-group unread counts merged into the main conversation list

#### UI/UX & Media

- Custom fonts with expo-font, per-locale font families
- Responsive design using NativeWind (TailwindCSS)
- Multiple app icon themes
- Image picker for profile photos and message attachments
- Full-screen image gallery with swipe navigation
- Save received images to the device photo library
- Link preview cards rendered from URLs in messages

### State Management

- Zustand for global state (conversations, unread counts, friend requests)
- Context API for auth, socket, network, locale, and app-state

### Navigation

- File-based routing with expo-router
- Root stack splits into `guests` (unauthenticated) and `members` (protected)
- `members` is a native stack containing a bottom-tab navigator plus pushed detail screens
- Back navigation pops the stack — never `replace` onto a route already in history, which silently duplicates screens

### Localization

- English and Japanese, stored as JSON in `src/localization/`
- Accessed through the `useTranslation` hook, backed by `LocaleContext`
- Locale switches apply instantly without a restart
- Font families swap per locale via CSS variables (Funnel Display / Noto Sans JP)

### Push Notifications

- Firebase Cloud Messaging (FCM) integration
- Badge count management
- Background notification handling
- Multi-device token management with a stable per-install device ID

## Development

### Project Structure

```
src/
├── app/                    # Application screens and file-based routes
│   ├── guests/            # Auth screens (login, signup, forgot password, EULA)
│   └── members/           # Protected screens
│       └── (tabs)/        # Bottom tabs (home, edit friends, settings, logout)
├── assets/                # Fonts, icons, and images
├── components/            # Reusable UI components
│   ├── *Conversation*     # Chat-related components
│   ├── *Edit*             # Friend management components
│   ├── *Message*          # Image/message display components
│   ├── *Settings*         # Account settings components
│   └── *Custom*           # Generic UI components
├── constants/             # App constants and configurations
├── context/               # React Context providers (Auth, Socket, Network, Locale, AppState)
├── hooks/                 # Custom React hooks for API calls and state
├── localization/          # Translation files (en.json, ja.json)
├── services/              # External service integrations (socket service)
├── utils/                 # Helper functions and utilities
└── zustand/               # Global state management stores
```

Native `ios/` and `android/` directories are not committed. They are generated by prebuild during the build, so all native configuration lives in `app.config.js`.

### Running in Development

```bash
# Start development server
npm start

# Run on iOS simulator (requires macOS + Xcode)
npm run ios

# Build development client
eas build --profile development --platform ios
```

### Data Fetching Conventions

- Screens that must show fresh data on return use `useFocusEffect`, not `useEffect`. A plain mount effect will not re-run when a screen is revealed by a back navigation, because it never unmounted.
- Refreshes keep existing rows on screen rather than swapping to a spinner. Only the first load blanks the view.

## Versioning

The app version lives in three places and all three must be kept in sync:

| Location | Field | Purpose |
| --- | --- | --- |
| `package.json` | `version` | Repo bookkeeping |
| `app.config.js` | `expo.version` | iOS marketing version (`CFBundleShortVersionString`) |
| `.env` | `EXPO_PUBLIC_APP_VERSION` | Version shown on the Settings screen |

The iOS **build number** (`CFBundleVersion`) is not stored in the repo. `eas.json` sets `cli.appVersionSource: "remote"` with `autoIncrement: true` on the production profile, so EAS assigns and increments it server-side on each production build.

## Building for Production

### Prerequisites for Production Builds

- EAS CLI installed: `npm install -g eas-cli`
- Apple Developer Account with App Store Connect access
- Firebase project configured for push notifications

### Production Build Commands

```bash
# Build for iOS App Store (runs on EAS cloud builders)
eas build --platform ios --profile production
```

```bash
# Or build locally instead of queueing on EAS (requires macOS + Xcode)
eas build --platform ios --profile production --local
```

```bash
# Upload the most recent EAS build to App Store Connect
eas submit --platform ios --latest
```

```bash
# Build and upload in one step
eas build --platform ios --profile production --auto-submit
```

`eas submit` only uploads the binary. Attaching the build to a version and submitting for review is still done manually in App Store Connect.
