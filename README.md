# BTC2 Mobile App (Frontend)

[![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52.0-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud_Messaging-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io_Client-4.8-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-NativeWind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

A modern iOS messaging app built with React Native and Expo, featuring real-time messaging, push notifications. This invite-only app requires an existing member's unique ID to join.
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
- Friend management system
- Profile customization (nickname, unique ID, profile image)
- Push notifications with badge count
- Customizable app icons
- Secure storage with expo-secure-store
- Responsive UI with NativeWind (TailwindCSS)

#### Update Plans

- Group chat support
- File sharing in messages
- User blocking
- Email registration
- Password recovery

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
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/1.0.0
EXPO_PUBLIC_API_DEV_URL=https://192.168.1.2/1.0.0
EXPO_PUBLIC_API_PROFILE_IMAGE_URL=/users/profileImage/
EXPO_PUBLIC_APP_VERSION=1.0.0
```

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

#### Authentication

- JWT-based authentication
- Secure token storage using expo-secure-store
- Protected route handling with expo-router

#### Real-time Communication

- Socket.io client integration
- Automatic reconnection handling
- Background connection management

#### UI/UX

- Custom fonts with expo-font
- Responsive design using NativeWind
- Custom pre-configured app icon selection
- Image picker for profile photos

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
├── app/              # Application screens and navigation
├── components/       # Reusable UI components
├── constants/        # App constants and configs
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── services/        # API and socket services
├── utils/           # Helper functions
└── zustand/         # State management stores
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
