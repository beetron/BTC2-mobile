const withFirebaseAppDelegate = require("./plugins/withFirebaseAppDelegate");

const IS_DEV_VARIANT = process.env.APP_VARIANT === "development";

module.exports = {
  expo: {
    name: IS_DEV_VARIANT ? "bTC2 Dev" : "bTC2",
    slug: "btc2",
    version: "1.1.0",
    orientation: "portrait",
    icon: "",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      useFrameworks: "static",
      googleServicesFile: IS_DEV_VARIANT
        ? "./prebuild/dev-GoogleService-Info.plist"
        : process.env.EXPO_PUBLIC_ENV === "development"
          ? "./prebuild/GoogleService-Info.plist"
          : process.env.GOOGLESERVICE_INFO_PLIST,
      icon: IS_DEV_VARIANT
        ? {
            dark: "./src/assets/icons/ios-icon1.png",
            light: "./src/assets/icons/ios-icon1.png",
            tinted: "./src/assets/icons/ios-icon1.png",
          }
        : {
            // Default IOS icon
            dark: "./src/assets/icons/ios-dark.png",
            light: "./src/assets/icons/ios-light.png",
            tinted: "./src/assets/icons/ios-tinted.png",
          },
      entitlements: {
        "aps-environment": "development",
      },
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
        NSPhotoLibraryUsageDescription:
          "This app accesses your photo library to allow you to select and upload images for your profile picture, and to attach photos from your library to send in chat messages.",
      },
      supportsTablet: true,
      bundleIdentifier: IS_DEV_VARIANT
        ? "com.beetron.btc2.dev"
        : "com.beetron.btc2",
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "",
        backgroundColor: "#ffffff",
      },
      package: IS_DEV_VARIANT ? "com.beetron.btc2.dev" : "com.beetron.btc2",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "",
    },
    plugins: [
      [
        "expo-alternate-app-icons",
        [
          {
            name: "icon1",
            ios: "./src/assets/icons/ios-icon1.png",
          },
          {
            name: "icon2",
            ios: "./src/assets/icons/ios-icon2.png",
          },
          {
            name: "icon3",
            ios: "./src/assets/icons/ios-icon3.png",
          },
          {
            name: "icon4",
            ios: "./src/assets/icons/ios-icon4.png",
          },
        ],
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            forceStaticLinking: ["RNFBApp", "RNFBMessaging"],
            podfileProperties: {
              "use_modular_headers!": true,
            },
          },
        },
      ],
      "expo-image-picker",
      "expo-router",
      [
        "expo-font",
        {
          "funnel-bold": ["./src/assets/fonts/FunnelDisplay-Bold.ttf"],
          "funnel-extra-bold": [
            "./src/assets/fonts/FunnelDisplay-ExtraBold.ttf",
          ],
          "funnel-light": ["./src/assets/fonts/FunnelDisplay-Light.ttf"],
          "funnel-medium": ["./src/assets/fonts/FunnelDisplay-Medium.ttf"],
          "funnel-regular": ["./src/assets/fonts/FunnelDisplay-Regular.ttf"],
          "funnel-semi-bold": ["./src/assets/fonts/FunnelDisplay-SemiBold.ttf"],
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./src/assets/icons/splash-icon-light.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            image: "./src/assets/icons/splash-icon-dark.png",
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-secure-store",
      "expo-image",
      "expo-web-browser",
      withFirebaseAppDelegate,
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "fa9fbe86-78e7-4749-8925-942d54a5a3a2",
      },
    },
    owner: "beetron",
  },
};
