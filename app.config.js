module.exports = {
  expo: {
    name: "bTC2",
    slug: "btc2",
    version: "0.0.1",
    orientation: "portrait",
    icon: "",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      useFrameworks: "static",
      googleServicesFile: process.env.GOOGLESERVICE_INFO_PLIST,
      icon: {
        // Default IOS icon
        dark: "./app/assets/icons/ios-dark.png",
        light: "./app/assets/icons/ios-light.png",
        tinted: "./app/assets/icons/ios-tinted.png",
      },
      entitlements: {
        "aps-environment": "development",
      },
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
      },
      supportsTablet: true,
      bundleIdentifier: "com.beetron.btc2",
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "",
        backgroundColor: "#ffffff",
      },
      package: "com.beetron.btc2",
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
            ios: "./app/assets/icons/ios-icon1.png",
          },
          {
            name: "icon2",
            ios: "./app/assets/icons/ios-icon2.png",
          },
          {
            name: "icon3",
            ios: "./app/assets/icons/ios-icon3.png",
          },
          {
            name: "icon4",
            ios: "./app/assets/icons/ios-icon4.png",
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
          "funnel-bold": ["./app/assets/fonts/FunnelDisplay-Bold.ttf"],
          "funnel-extra-bold": [
            "./app/assets/fonts/FunnelDisplay-ExtraBold.ttf",
          ],
          "funnel-light": ["./app/assets/fonts/FunnelDisplay-Light.ttf"],
          "funnel-medium": ["./app/assets/fonts/FunnelDisplay-Medium.ttf"],
          "funnel-regular": ["./app/assets/fonts/FunnelDisplay-Regular.ttf"],
          "funnel-semi-bold": ["./app/assets/fonts/FunnelDisplay-SemiBold.ttf"],
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./app/assets/icons/splash-icon-light.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            image: "./app/assets/icons/splash-icon-dark.png",
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-secure-store",
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
