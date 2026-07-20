const { withAppDelegate } = require("@expo/config-plugins");

// @react-native-firebase/app's own config plugin can't find an insertion
// point in Expo's Swift AppDelegate template, so it silently skips adding
// `FirebaseApp.configure()` (see: "Unable to determine correct Firebase
// insertion point in AppDelegate.swift" during prebuild). Without this call,
// Firebase crashes at runtime the moment any Firebase API is touched.
module.exports = function withFirebaseAppDelegate(config) {
  return withAppDelegate(config, (config) => {
    const contents = config.modResults.contents;

    if (contents.includes("FirebaseApp.configure()")) {
      return config;
    }

    const marker =
      "didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil\n  ) -> Bool {";

    if (!contents.includes(marker)) {
      throw new Error(
        "withFirebaseAppDelegate: could not find didFinishLaunchingWithOptions in AppDelegate.swift"
      );
    }

    config.modResults.contents = contents.replace(
      marker,
      `${marker}\n    FirebaseApp.configure()`
    );

    return config;
  });
};
