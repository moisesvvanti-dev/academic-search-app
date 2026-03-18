import { View, ViewProps, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedProps, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { useEffect } from "react";

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withGradient?: boolean;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function ScreenContainer({ 
  children, 
  className, 
  style, 
  scrollable = false,
  withGradient = true,
  ...props 
}: ScreenContainerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isTab = className?.includes("tab");
  
  const Content = scrollable ? ScrollView : View;

  // Animation values for gradient positions
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const endX = useSharedValue(1);
  const endY = useSharedValue(1);

  useEffect(() => {
    if (withGradient) {
      startX.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 10000, easing: Easing.linear }),
          withTiming(0, { duration: 10000, easing: Easing.linear })
        ),
        -1,
        true
      );
      startY.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 8000, easing: Easing.linear }),
          withTiming(0, { duration: 8000, easing: Easing.linear })
        ),
        -1,
        true
      );
    }
  }, [withGradient]);

  const animatedGradientProps = useAnimatedProps(() => {
    return {
      start: { x: startX.value, y: startY.value },
      end: { x: endX.value, y: endY.value },
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {withGradient && (
        <>
          <AnimatedLinearGradient
            colors={[colors.primary + '30', colors.background, colors.accent + '20', colors.background]}
            animatedProps={animatedGradientProps as any}
            style={StyleSheet.absoluteFill}
          />
          <View 
            style={[
              styles.headerBlur,
              { height: insets.top + (isTab ? 10 : 20), backgroundColor: colors.background + '80' }
            ]} 
          />
        </>
      )}
      <Content
        className={className}
        style={[{ flex: 1, paddingTop: insets.top }, style]}
        {...props}
      >
        {children}
      </Content>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  }
});
