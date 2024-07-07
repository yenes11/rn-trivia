import Confetti from '@/assets/lottie/confetti.json';
import Wrong from '@/assets/lottie/wrong-new.json';
import Button from '@/components/Button';
import { MonoText } from '@/components/StyledText';
import Timer from '@/components/Timer';
import { colors } from '@/constants/Colors';
import useGameStore from '@/store/useGameStore';
import { getRandomQuestions } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FlipOutEasyX,
  LinearTransition,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const totalQuestionCount = 15;
const AnimatedButton = Animated.createAnimatedComponent(Button);
const AnimatedMaskView = Animated.createAnimatedComponent(MaskedView);

type Display = 'none' | 'flex' | undefined;
type Variant = 'primary' | 'secondary' | 'danger';
interface TimerRef {
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const GameScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    gameMode,
    currentQuestionIndex,
    correctLottieDisplay,
    wrongLottieDisplay,
    options,
    selectedAnswer,
    sessionQuestions,
    totalQuestionCount,
    points,
    secondChanceJoker,
    fiftyFiftyJoker,
    chanceToSelect,
    changeQuestionJoker,
    givenAnswers,
    secondChance,
    fiftyFifty,
    changeQuestion,
    nextQuestion,
    selectOption,
  } = useGameStore();
  const correctLottieRef = React.useRef<LottieView>(null);
  const wrongLottieRef = React.useRef<LottieView>(null);
  const timer = React.useRef<TimerRef>(null);
  const currentQuestion = sessionQuestions[currentQuestionIndex];
  const questionHeight = useSharedValue(0);
  const floatingButtonY = useSharedValue(0);

  useFocusEffect(
    React.useCallback(() => {
      console.log('focused');
      timer.current?.reset();
      timer.current?.start();
      floatingButtonY.value = withRepeat(
        withTiming(8, { duration: 1500 }),
        -1,
        true
      );

      return () => {
        timer.current?.stop();
        setTimeout(() => {
          timer.current?.reset();
        }, 500);
        console.log('This route is now unfocused.');
      };
    }, [])
  );

  const isCorrect = (answer: string): Variant => {
    if (!selectedAnswer) return 'secondary';

    const isCorrectAnswer = givenAnswers.includes(
      currentQuestion.correctAnswer
    );

    const isSelectedAnswer = givenAnswers.includes(answer);

    if (isCorrectAnswer && isSelectedAnswer && selectedAnswer !== answer) {
      return 'danger';
    }

    if (isSelectedAnswer && isCorrectAnswer) return 'primary';
    if (isSelectedAnswer && !isCorrectAnswer) return 'danger';
    if (chanceToSelect === 0 && answer === currentQuestion.correctAnswer)
      return 'primary';

    return 'secondary';
  };

  const onAnimationFinish = () => {
    timer.current?.start();
    nextQuestion();
    if (
      currentQuestionIndex === totalQuestionCount - 1 ||
      (gameMode === 'Classic' &&
        selectedAnswer !== currentQuestion.correctAnswer)
    ) {
      navigation.navigate('game-over');
    }
  };

  const derivedWidthValue = useDerivedValue(() => {
    return withTiming(((currentQuestionIndex + 1) / totalQuestionCount) * 100);
  }, [currentQuestionIndex]);

  const floatingButtonStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: floatingButtonY.value,
      },
    ],
  }));

  const animatedProgressStyles = useAnimatedStyle(() => {
    return {
      width: `${derivedWidthValue.value}%`,
    };
  });

  const handleSelect = (value: string) => {
    selectOption(value);
    if (chanceToSelect !== 2) {
      timer.current?.stop();
    }
    if (value === currentQuestion.correctAnswer) {
      correctLottieRef.current?.play();
    } else if (
      chanceToSelect !== 2 &&
      value !== currentQuestion.correctAnswer
    ) {
      wrongLottieRef.current?.play();
    }
  };
  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <LottieView
        ref={correctLottieRef}
        loop={false}
        onAnimationFinish={onAnimationFinish}
        style={[styles.lottie, { display: correctLottieDisplay }]}
        resizeMode="center"
        source={Confetti}
      />
      <LottieView
        ref={wrongLottieRef}
        speed={0.8}
        loop={false}
        onAnimationFinish={onAnimationFinish}
        style={[styles.lottie, { display: wrongLottieDisplay }]}
        resizeMode="center"
        source={Wrong}
      />
      <View style={styles.header}>
        {gameMode === 'Timed' && (
          <Timer
            ref={timer}
            onTimeout={() => {
              navigation.navigate('game-over');
            }}
            style={styles.timer}
          />
        )}
        <Animated.Text style={styles.points}>
          {points}
          <MonoText style={{ fontSize: 20, color: '#C4FE5F80' }}> pts</MonoText>
        </Animated.Text>
      </View>

      <Text
        style={{
          color: colors.primary,
          fontSize: 18,
          marginBottom: 12,
          fontFamily: 'Blauer',
          marginHorizontal: 16,
        }}
      >
        Question {`${currentQuestionIndex + 1} `}
        {gameMode === 'Timed' && (
          <Text style={{ color: '#C4FE5F80' }}>of {totalQuestionCount}</Text>
        )}
      </Text>
      <View
        style={{
          backgroundColor: colors.primaryFade,
          borderRadius: 99,
          marginBottom: 22,
          marginHorizontal: 16,
        }}
      >
        <Animated.View style={[styles.progressBar, animatedProgressStyles]} />
      </View>
      {/* {
        chanceToSelect > 0 ? ( */}
      <Animated.Text
        // entering={SlideInLeft}
        // exiting={SlideOutRight.delay(1500)}
        layout={LinearTransition}
        onLayout={({ nativeEvent, currentTarget }) => {
          questionHeight.value = nativeEvent.layout.height;
        }}
        style={styles.question}
      >
        {currentQuestion.question}
      </Animated.Text>

      <AnimatedMaskView
        layout={LinearTransition}
        style={{
          flex: 1,
          flexDirection: 'column',
          height: '100%',
          // paddingTop: 8,
        }}
        maskElement={
          <LinearGradient
            style={{
              flex: 1,
              flexDirection: 'column',
              height: '100%',
            }}
            colors={[
              'transparent',
              colors.backgroud,
              colors.backgroud,
              'transparent',
            ]}
            locations={[0, 0.07, 0.9, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        }
      >
        <ScrollView
          // style={{ flex: 1 }}
          contentContainerStyle={{
            rowGap: 16,
            paddingBottom: insets.bottom + 128,
            paddingTop: 36,
            paddingHorizontal: 16,
          }}
        >
          {options.map((item) => (
            <Animated.View
              key={item}
              entering={FadeInDown.duration(200)}
              exiting={FlipOutEasyX.duration(200)}
              layout={LinearTransition.springify().delay(200).damping(13)}
            >
              <Button
                onPress={() => handleSelect(item)}
                label={item}
                variant={isCorrect(item)}
              />
            </Animated.View>
          ))}
        </ScrollView>
      </AnimatedMaskView>

      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', '#C4FE5F40']}
        style={[styles.jokerContainer, { paddingBottom: insets.bottom + 16 }]}
      >
        <AnimatedButton
          variant="secondary"
          disabled={!fiftyFiftyJoker}
          labelStyle={{ fontSize: 14, color: colors.primary }}
          style={[styles.jokerButton, floatingButtonStyles]}
          onPress={fiftyFifty}
          label="50/50"
        />
        <AnimatedButton
          disabled={!secondChanceJoker}
          onPress={secondChance}
          labelStyle={{ color: colors.primary }}
          variant="secondary"
          style={[styles.jokerButton, floatingButtonStyles]}
          label="2X"
        />
        <AnimatedButton
          disabled={!changeQuestionJoker}
          variant="secondary"
          onPress={changeQuestion}
          style={[styles.jokerButton, floatingButtonStyles]}
          icon={<Ionicons name="repeat" size={32} color={colors.primary} />}
        />
      </LinearGradient>
    </View>
  );
};

export default GameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroud,
    // paddingHorizontal: 16,
  },
  lottie: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    zIndex: 999,
  },
  timer: {
    // marginBottom: 16,
    width: 64,
    height: 64,
  },
  jokerButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 99,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 99,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  points: {
    fontSize: 28,
    color: colors.primary,
    fontFamily: 'Blauer',
  },
  question: {
    color: 'white',
    fontSize: 28,
    // marginBottom: 36,
    fontWeight: '700',
    fontFamily: 'Blauer Bold',
    marginHorizontal: 16,
    // backgroundColor: 'cornflowerblue',
  },
  jokerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingTop: 48,
    width: Dimensions.get('screen').width,
  },
});
