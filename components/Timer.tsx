import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, type SvgProps, Text } from 'react-native-svg';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors } from '@/constants/Colors';
import { useNavigation } from 'expo-router';

interface TimerProps extends SvgProps {
  start?: number;
  onTimeout?: () => void;
}

interface TimerRef {
  start: () => void;
  stop: () => void;
}
const radius = 88;
const circumference = 2 * Math.PI * radius;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(Text);

const Timer = forwardRef<TimerRef, TimerProps>(
  ({ start = 60, onTimeout = () => {}, ...rest }, ref) => {
    const navigation = useNavigation();
    const [seconds, setSeconds] = useState(start);
    const [isRunning, setIsRunning] = useState(false);
    const progress = useSharedValue(0);
    const circleColorProgress = useSharedValue(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setSeconds(start);
        progress.value = 0;
        circleColorProgress.value = 0;
      },
      start: () => {
        if (!isRunning && seconds > 0) {
          setIsRunning(true);
          circleColorProgress.value = withTiming(1, {
            duration: seconds * 1000,
          });
          intervalRef.current = setInterval(() => {
            setSeconds((prev) => {
              if (prev > 0) {
                progress.value = withTiming(
                  (circumference * (start - (prev - 2))) / start,
                  {
                    duration: 1000,
                    easing: Easing.linear,
                  }
                );
                return prev - 1;
              }
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                setIsRunning(false);
              }
              return 0;
            });
          }, 1000);
        }
      },
      stop: () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
        }
        cancelAnimation(circleColorProgress);
      },
    }));

    useEffect(() => {
      if (seconds === 0) {
        onTimeout();
      }
    }, [seconds]);

    useEffect(() => {
      // ref.current?.start(); // Automatically start the timer on mount

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);

    const animatedBackgroundProps = useAnimatedProps(() => {
      const strokeColor = interpolateColor(
        circleColorProgress.value,
        [0, 1],
        [colors.primaryFade, colors.dangerFade]
      );

      return {
        strokeDashoffset: progress.value,
        stroke: strokeColor,
      };
    });

    const animatedCircleProps = useAnimatedProps(() => {
      const strokeColor = interpolateColor(
        circleColorProgress.value,
        [0, 1],
        [colors.primary, colors.danger]
      );

      return {
        strokeDashoffset: progress.value,
        stroke: strokeColor,
      };
    });

    const animatedTextProps = useAnimatedProps(() => {
      const strokeColor = interpolateColor(
        circleColorProgress.value,
        [0, 1],
        ['#C4FE5F', '#fa114f']
      );

      return {
        fill: strokeColor,
      };
    });

    return (
      <Svg viewBox="0 0 200 200" {...rest}>
        <AnimatedCircle
          cx="100"
          cy="100"
          r={radius.toString()}
          strokeWidth="24"
          fill="none"
          animatedProps={animatedBackgroundProps}
        />
        <AnimatedCircle
          opacity={isRunning ? 1 : 0.5}
          cx="100"
          cy="100"
          r={radius.toString()}
          strokeWidth="24"
          fill="none"
          strokeDasharray={`${circumference}, ${circumference}`}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
        />

        <AnimatedText
          x="100"
          y="123"
          textAnchor="middle"
          fontSize="64"
          // fontWeight={700}
          fontFamily="Blauer Medium"
          animatedProps={animatedTextProps}
        >
          {seconds}
        </AnimatedText>
      </Svg>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Timer;
