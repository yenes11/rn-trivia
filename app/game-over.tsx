import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import GameOverLottie from '@/assets/lottie/game-over.json';
import TrophyLottie from '@/assets/lottie/trophy.json';
import Animated, {
  ZoomIn,
  ZoomOut,
  ZoomOutUp,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import TrophyImage from '@/assets/svg/Trophy';
import { MonoText } from '@/components/StyledText';
import Button from '@/components/Button';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useGameStore from '@/store/useGameStore';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);
const AnimatedTrophyImage = Animated.createAnimatedComponent(TrophyImage);

const GameOverScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const lottieRef = useRef<LottieView>(null);
  const progress = useSharedValue(0);
  const [didAnimationEnd, setDidAnimationEnd] = useState(false);
  const {
    initializeSessionQuestions,
    correctAnswerCount,
    wrongAnswerCount,
    points,
  } = useGameStore();

  useEffect(() => {
    progress.value = withSequence(
      withTiming(0.7, {
        duration: 700,
      }),
      withTiming(1, {
        duration: 300,
      })
    );
  }, []);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 44, paddingBottom: insets.bottom + 16 },
      ]}
    >
      {!didAnimationEnd && (
        <AnimatedLottieView
          exiting={ZoomOutUp.duration(500)}
          ref={lottieRef}
          // progress={progress.value}
          autoPlay
          loop={false}
          onAnimationFinish={() => setDidAnimationEnd(true)}
          style={[styles.lottie]}
          resizeMode="cover"
          source={GameOverLottie}
        />
      )}
      {didAnimationEnd && (
        <Animated.View
          style={{
            backgroundColor: 'transparent',
            alignItems: 'center',
            width: '100%',
            gap: 16,
          }}
          entering={ZoomIn}
        >
          <AnimatedTrophyImage
            style={{
              width: 200,
              height: 200,
              alignSelf: 'center',
            }}
          />
          <Text
            style={{
              color: 'white',
              fontSize: 24,
            }}
          >
            {points} POINTS
          </Text>
          <Text
            style={{
              color: 'white',
              fontSize: 24,
            }}
          >
            Correct Answers: {correctAnswerCount}
          </Text>
          <Text
            style={{
              color: 'white',
              fontSize: 24,
              marginBottom: 24,
            }}
          >
            Wrong Answers: {wrongAnswerCount}
          </Text>

          <Button
            rounded
            onPress={() => {
              initializeSessionQuestions('Classic');
              navigation.navigate('game');
            }}
            icon={
              <FontAwesome color={colors.backgroud} size={18} name="repeat" />
            }
            style={{ width: '100%' }}
            label="Play Again"
          />
          <Button
            rounded
            onPress={() => navigation.navigate('index')}
            icon={<Ionicons name="home" size={18} color="white" />}
            style={{ width: '100%' }}
            label="Main Menu"
            variant="secondary"
          />
        </Animated.View>
      )}
    </View>
  );
};

export default GameOverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroud,
    alignItems: 'center',
    // justifyContent: 'center',
    paddingHorizontal: 16,
  },
  lottie: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    zIndex: 999,
  },
});
