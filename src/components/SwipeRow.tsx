import React, { forwardRef, useImperativeHandle } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export interface SwipeRowHandle {
  close: () => void;
}

interface SwipeRowProps {
  // Total width of the revealed action area. Fixed, so nothing has to be
  // measured at gesture time.
  actionsWidth: number;
  // Rendered behind the row, right-aligned, actionsWidth wide
  actions: React.ReactNode;
  children: React.ReactNode;
  // Plain tap on the row while it is closed
  onPress?: () => void;
  onOpen?: () => void;
}

const SPRING = { damping: 22, stiffness: 240, mass: 0.8 };

// Minimal swipe-left-to-reveal row. Replaces gesture-handler's
// ReanimatedSwipeable, which crashed here ("Value is null, expected an
// Object"): on every gesture start it measure()s two empty placeholder
// views, which the new architecture flattens away, so measure gets a null
// node. This version never measures -- the action width is a prop.
const SwipeRow = forwardRef<SwipeRowHandle, SwipeRowProps>(
  ({ actionsWidth, actions, children, onPress, onOpen }, ref) => {
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);

    useImperativeHandle(ref, () => ({
      close: () => {
        translateX.value = withSpring(0, SPRING);
      },
    }));

    const notifyOpen = () => onOpen?.();
    const notifyPress = () => onPress?.();

    const pan = Gesture.Pan()
      // Horizontal intent only -- vertical drags keep scrolling the list
      .activeOffsetX([-12, 12])
      .failOffsetY([-10, 10])
      .onStart(() => {
        startX.value = translateX.value;
      })
      .onUpdate((event) => {
        const next = startX.value + event.translationX;
        translateX.value = Math.min(0, Math.max(-actionsWidth, next));
      })
      .onEnd((event) => {
        const shouldOpen =
          translateX.value < -actionsWidth / 2 || event.velocityX < -600;
        translateX.value = withSpring(shouldOpen ? -actionsWidth : 0, SPRING);
        if (shouldOpen) runOnJS(notifyOpen)();
      });

    const tap = Gesture.Tap().onEnd((_event, success) => {
      if (!success) return;
      if (translateX.value !== 0) {
        // Tapping an open row just closes it
        translateX.value = withSpring(0, SPRING);
      } else {
        runOnJS(notifyPress)();
      }
    });

    const rowStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    return (
      <View style={{ overflow: "hidden" }}>
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: actionsWidth,
            flexDirection: "row",
          }}
        >
          {actions}
        </View>
        <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
          <Animated.View style={rowStyle}>{children}</Animated.View>
        </GestureDetector>
      </View>
    );
  }
);

SwipeRow.displayName = "SwipeRow";

export default SwipeRow;
