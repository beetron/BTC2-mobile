import { useCallback, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNetwork } from "../context/NetworkContext";
import { useTranslation } from "../hooks/useTranslation";
import { useThemeColors } from "../context/ThemeContext";

interface ScrollState {
  atBottom: boolean;
  scrollable: boolean;
}

interface LegalDocumentWebViewProps {
  url: string;
  onScrollStateChange?: (state: ScrollState) => void;
}

// Tracks scroll position inside the loaded page and reports it back to RN.
// Content that fits without scrolling is reported as already "at bottom".
const SCROLL_TRACKING_SCRIPT = `
(function () {
  function computeState() {
    var doc = document.scrollingElement || document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight > 24;
    var reachedBottom = doc.scrollHeight - doc.clientHeight - doc.scrollTop <= 24;
    window.ReactNativeWebView.postMessage(JSON.stringify({
      scrollable: scrollable,
      atBottom: !scrollable || reachedBottom,
    }));
  }
  window.addEventListener("scroll", computeState);
  window.addEventListener("load", computeState);
  computeState();
  setTimeout(computeState, 300);
  true;
})();
`;

const LegalDocumentWebView: React.FC<LegalDocumentWebViewProps> = ({
  url,
  onScrollStateChange,
}) => {
  const { isConnected } = useNetwork();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      if (!onScrollStateChange) return;
      try {
        const state: ScrollState = JSON.parse(event.nativeEvent.data);
        onScrollStateChange(state);
      } catch {
        // Ignore malformed messages
      }
    },
    [onScrollStateChange]
  );

  const handleRetry = () => {
    setHasError(false);
    setReloadKey((key) => key + 1);
  };

  if (!isConnected) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <MaterialCommunityIcons name="wifi-off" size={40} color={colors.inkMuted} />
        <Text className="text-inkMuted font-funnel-regular text-center text-lg mt-4">
          {t("legalDocument.offlineMessage")}
        </Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={40}
          color={colors.warning}
        />
        <Text className="text-inkMuted font-funnel-regular text-center text-lg mt-4 mb-4">
          {t("legalDocument.loadErrorMessage")}
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          accessibilityRole="button"
          className="bg-primary rounded-2xl px-6 py-3"
          style={{ minHeight: 48, justifyContent: "center" }}
        >
          <Text className="text-onPrimary font-funnel-semi-bold text-base">
            {t("legalDocument.retryButton")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <WebView
      key={reloadKey}
      source={{ uri: url }}
      className="flex-1"
      injectedJavaScript={SCROLL_TRACKING_SCRIPT}
      onMessage={handleMessage}
      onError={() => setHasError(true)}
      onHttpError={() => setHasError(true)}
      startInLoadingState
      renderLoading={() => (
        <View className="absolute inset-0 justify-center items-center bg-bg">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    />
  );
};

export default LegalDocumentWebView;
