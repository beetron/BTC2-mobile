const IS_DEV_VARIANT = process.env.APP_VARIANT === "development";

module.exports = {
  expo: {
    name: IS_DEV_VARIANT ? "bTC2 Dev" : "bTC2",
    slug: "btc2",
    version: "1.2.2",
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
        "aps-environment": IS_DEV_VARIANT ? "development" : "production",
      },
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
        NSPhotoLibraryUsageDescription:
          "This app accesses your photo library to allow you to select and upload images for your profile picture, and to attach photos from your library to send in chat messages.",
        // Dev-variant only: the local BTC2-API run on a dev machine's LAN IP
        // has no TLS (nginx-terminated HTTPS is production-only), so ATS
        // needs an exception to allow plain HTTP to private-network
        // addresses. NSAllowsLocalNetworking is scoped to local/private IPs
        // and .local domains only. It does not relax ATS for arbitrary
        // internet hosts, and never applies to the production build.
        ...(IS_DEV_VARIANT
          ? {
              NSAppTransportSecurity: {
                NSAllowsLocalNetworking: true,
              },
            }
          : {}),
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
      [
        "expo-image-picker",
        {
          // Only launchImageLibraryAsync is used (no in-picker camera
          // capture) -- without this, the plugin still requests
          // NSMicrophoneUsageDescription/RECORD_AUDIO by default for a
          // permission the app never touches.
          microphonePermission: false,
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission:
            "This app uses the camera to scan a friend's QR code to add them.",
          // The app never records audio -- without this, the plugin still
          // adds NSMicrophoneUsageDescription with its own generic default
          // text for a permission we never request at runtime.
          microphonePermission: false,
        },
      ],
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
          // Registered under distinct native keys (not reused "funnel-*"
          // keys) since this plugin config is a static, non-locale-aware
          // manifest -- the actual per-locale "funnel-*" aliasing happens
          // in JS via getFontMap()/useFonts() in src/app/_layout.tsx.
          "noto-sans-jp-bold": ["./src/assets/fonts/NotoSansJP-Bold.ttf"],
          "noto-sans-jp-extra-bold": [
            "./src/assets/fonts/NotoSansJP-ExtraBold.ttf",
          ],
          "noto-sans-jp-light": ["./src/assets/fonts/NotoSansJP-Light.ttf"],
          "noto-sans-jp-medium": ["./src/assets/fonts/NotoSansJP-Medium.ttf"],
          "noto-sans-jp-regular": ["./src/assets/fonts/NotoSansJP-Regular.ttf"],
          "noto-sans-jp-semi-bold": [
            "./src/assets/fonts/NotoSansJP-SemiBold.ttf",
          ],
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
      [
        "expo-secure-store",
        {
          // Nothing stored here (auth tokens, locale) is saved with
          // requireAuthentication -- without this, the plugin still adds
          // NSFaceIDUsageDescription with generic text for a capability
          // the app never triggers.
          faceIDPermission: false,
        },
      ],
      [
        "expo-media-library",
        {
          // Not explicitly listed before -- autolinking still applied the
          // plugin's own generic default text for NSPhotoLibraryAddUsageDescription
          // (used by the "save image from chat" feature).
          savePhotosPermission:
            "This app saves images from chat messages to your photo library when you choose to save them.",
        },
      ],
      "expo-image",
      "expo-web-browser",
      "expo-localization",
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
