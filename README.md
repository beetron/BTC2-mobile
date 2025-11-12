# BTC2 Mobile App (Frontend)

[![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52.0-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud_Messaging-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io_Client-4.8-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-NativeWind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

A modern iOS messaging app built with React Native and Expo, featuring real-time messaging, push notifications, image sharing, and comprehensive member management. This invite-only app requires an existing member's unique ID to join.
<br>
The backend API for BTC2 could be found at: https://github.com/beetron/btc2_API

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
  - [Push Notifications](#push-notifications)
- [Development](#development)
- [Building for Production](#building-for-production)

## Features

#### Current Features

- User authentication (signup/login/logout)
- Real-time messaging with socket.io
- Friend management system (add, accept, reject, remove friends)
- Profile customization (nickname, unique ID, profile image)
- Push notifications with badge count
- Image sharing in conversations (multi-select support)
- Message management (delete messages, view message history)
- Password recovery (forgot password/username)
- Account management (change password, update email, delete account)
- Customizable app icons (multiple theme options)
- Secure storage with expo-secure-store
- Responsive UI with NativeWind (TailwindCSS)
- Network-aware connectivity handling
- Message caching for offline viewing

#### Future Plans

- Group chat support
- User blocking functionality
- Voice messages
- Message reactions and replies
- Single message deletions

## Setup

### Prerequisites

- Node.js 18+
- Xcode 15+ (for iOS development)
- Expo CLI
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
EXPO_PUBLIC_APP_VERSION=1.0.0
```

**Important:** For production builds, comment out `EXPO_PUBLIC_ENV=development` so the app uses `EXPO_PUBLIC_API_URL` instead of the development URL.

### Development Setup

1. Install Expo Go on your iOS device or setup iOS Simulator

2. Start the development server:

```bash
npx expo start
```

3. For iOS development build:

```bash
npx expo run:ios
```

## Architecture

### Key Features

#### Authentication & Account Management

- JWT-based authentication with secure token storage
- Password recovery via email
- Username recovery functionality
- Account deletion with secure logout
- Email and password updates
- Protected route handling with expo-router

#### Real-time Communication

- Socket.io client integration with automatic reconnection
- Background connection management
- Real-time messaging with delivery status
- Image sharing with multi-select support
- Message caching for offline viewing
- Network-aware connectivity handling

#### Friend & Social Features

- Comprehensive friend management (add, accept, reject, remove)
- Friend request system
- Profile customization with images and nicknames
- Unique ID system for member identification

#### UI/UX & Media

- Custom fonts with expo-font
- Responsive design using NativeWind (TailwindCSS)
- Multiple app icon themes
- Image picker for profile photos and message attachments
- Full-screen image gallery with swipe navigation

### State Management

- Zustand for global state management
- Context API for auth and socket state

### Navigation

- File-based routing with expo-router
- Protected routes
- Tab-based navigation

### Push Notifications

- Firebase Cloud Messaging (FCM) integration
- Badge count management
- Background notification handling
- Multi-device token management

## Development

### Project Structure

```
src/
├── app/                    # Application screens and navigation
│   ├── guests/            # Authentication screens (login, signup, forgot password)
│   ├── members/           # Member-only screens (home, settings, logout)
│   └── screens/           # Shared screens (conversation, settings pages)
├── components/            # Reusable UI components
│   ├── *Conversation*     # Chat-related components
│   ├── *Edit*            # Friend management components
│   ├── *Message*         # Image/message display components
│   ├── *Settings*        # Account settings components
│   └── *Custom*          # Generic UI components
├── constants/            # App constants and configurations
├── context/              # React Context providers (Auth, Socket, Network)
├── hooks/               # Custom React hooks for API calls and state
├── services/            # External service integrations
├── utils/               # Helper functions and utilities
└── zustand/             # Global state management stores
```

### Running in Development

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Build development client
eas build --profile development --platform ios
```

## Building for Production

### Prerequisites for Production Builds

- EAS CLI installed: `npm install -g @expo/eas-cli`
- Apple Developer Account with App Store Connect access
- Firebase project configured for push notifications

### Production Build Commands

```bash
# Build for iOS App Store
eas build --platform ios --profile production

# Submit to TestFlight for testing
eas submit --platform ios --profile testflight

# Submit to App Store Review
eas submit --platform ios --profile production
```
