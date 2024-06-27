import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MonoText } from "@/components/StyledText";
import Button from "@/components/Button";
import Timer from "@/components/Timer";
import LottieView from "lottie-react-native";
import Confetti from "@/assets/lottie/confetti.json";
import Wrong from "@/assets/lottie/wrong-new.json";
import { triviaQuestions } from "@/assets/questions";
import { getRandomQuestions } from "@/utils/helpers";
import { LinearGradient } from "expo-linear-gradient";
import useGameStore from "@/store/useGameStore";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  Easing,
  useDerivedValue,
  useAnimatedProps,
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  SequencedTransition,
  FadingTransition,
  JumpingTransition,
  CurvedTransition,
  combineTransition,
  useAnimatedStyle,
  withSequence,
  withRepeat,
  SlideInLeft,
  SlideOutRight,
  Layout,
  FlipInXUp,
  FlipOutEasyX,
} from "react-native-reanimated";
import { useFocusEffect, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Rect, Svg } from "react-native-svg";
import { BlurView } from "expo-blur";

const totalQuestionCount = 15;
const sessionQuestions = getRandomQuestions(totalQuestionCount);
const AnimatedButton = Animated.createAnimatedComponent(Button);
// const AnimatedMonoText = Animated.createAnimatedComponent(MonoText);

type Display = "none" | "flex" | undefined;
type Variant = "primary" | "secondary" | "danger";
interface TimerRef {
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const GameScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
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
    changeQuestionJoker,
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
      console.log("focused");
      timer.current?.reset();
      timer.current?.start();
      floatingButtonY.value = withRepeat(
        withTiming(8, { duration: 1500 }),
        -1,
        true
      );

      return () => {
        timer.current?.stop();
        console.log("This route is now unfocused.");
      };
    }, [])
  );

  const isCorrect = (answer: string): Variant => {
    if (
      selectedAnswer &&
      currentQuestion.correctAnswer !== selectedAnswer &&
      currentQuestion.correctAnswer === answer
    ) {
      return "primary";
    }
    if (answer !== selectedAnswer) {
      return "secondary";
    }
    return answer === currentQuestion.correctAnswer ? "primary" : "danger";
  };

  const onAnimationFinish = () => {
    timer.current?.start();
    nextQuestion();
    if (currentQuestionIndex === totalQuestionCount - 1) {
      navigation.navigate("game-over");
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

  const fillerViewStyles = useAnimatedStyle(() => {
    return {
      height: questionHeight.value,
    };
  });

  const layout = Layout.springify();

  const handleSelect = (value: string) => {
    selectOption(value);
    if (secondChanceJoker !== 2) {
      timer.current?.stop();
    }
    if (value === currentQuestion.correctAnswer) {
      correctLottieRef.current?.play();
    } else if (
      secondChanceJoker !== 2 &&
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
        <Timer
          ref={timer}
          // onTimeout={() => navigation.navigate('game-over')}
          style={styles.timer}
        />
        <Animated.Text style={styles.points}>
          {points}
          <MonoText style={{ fontSize: 20, color: "#C4FE5F80" }}> pts</MonoText>
        </Animated.Text>
      </View>

      <Text
        style={{
          color: colors.primary,
          fontSize: 18,
          marginBottom: 12,
          fontFamily: "Blauer",
          marginHorizontal: 16,
        }}
      >
        Question {`${currentQuestionIndex + 1} `}
        <Text style={{ color: "#C4FE5F80" }}>of {totalQuestionCount}</Text>
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
      {!selectedAnswer || (selectedAnswer && secondChanceJoker === 2) ? (
        <Animated.Text
          entering={SlideInLeft.duration(200)}
          exiting={SlideOutRight.duration(200).delay(1500)}
          onLayout={({ nativeEvent, currentTarget }) => {
            questionHeight.value = nativeEvent.layout.height;
          }}
          style={styles.question}
        >
          {currentQuestion.question}
        </Animated.Text>
      ) : (
        <Animated.View style={fillerViewStyles} />
      )}
      {/* <Animated.FlatList
        data={options}
        contentContainerStyle={{
          rowGap: 16,
          paddingBottom: insets.bottom + 128,
          paddingHorizontal: 16,
        }}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <LinearGradient
            colors={[colors.backgroud, "#0B051790", "#0B051700"]}
            style={[{ height: 18 }]}
          />
        }
        itemLayoutAnimation={layout}
        renderItem={({ item }) => (
          <Animated.View
            collapsable={false}
            key={item}
            entering={FadeInDown.duration(200)}
            exiting={FadeOutUp.duration(1000)}
            layout={layout}
          >
            <Button
              onPress={() => handleSelect(item)}
              label={item}
              variant={isCorrect(item)}
            />
          </Animated.View>
        )}
      /> */}

      <ScrollView
        contentContainerStyle={{
          rowGap: 16,
          paddingBottom: insets.bottom + 128,
          paddingHorizontal: 16,
        }}
      >
        <LinearGradient
          colors={[colors.backgroud, "#0B051790", "#0B051700"]}
          style={[{ height: 18 }]}
        />
        {options.map((item) => (
          <Animated.View
            collapsable={false}
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

      {/* <BlurView
        tint="dark"
        intensity={50}
        style={{
          flexDirection: "row",
          paddingBottom: insets.bottom,
          position: "absolute",
          bottom: 0,
          left: 0,
          borderTopWidth: 1,
          borderTopColor: colors.primaryFade,
        }}
      >
        <TouchableOpacity
          disabled={fiftyFiftyJoker === 3}
          onPress={fiftyFifty}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            opacity: fiftyFiftyJoker === 3 ? 0.3 : 1,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontFamily: "Blauer Medium",
              fontSize: 18,
            }}
          >
            50/50
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={secondChanceJoker === 3}
          onPress={secondChance}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            opacity: secondChanceJoker === 3 ? 0.3 : 1,
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontFamily: "Blauer Medium",
              fontSize: 18,
            }}
          >
            2X
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={changeQuestionJoker === 3}
          onPress={changeQuestion}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            opacity: changeQuestionJoker === 3 ? 0.3 : 1,
          }}
        >
          <Ionicons name="repeat" size={32} color={colors.primary} />
        </TouchableOpacity>
      </BlurView> */}
      <LinearGradient
        colors={["rgba(0, 0, 0, 0)", "#C4FE5F40"]}
        style={[styles.jokerContainer, { paddingBottom: insets.bottom + 16 }]}
      >
        <AnimatedButton
          variant="secondary"
          disabled={fiftyFiftyJoker === 3}
          labelStyle={{ fontSize: 14, color: colors.primary }}
          style={[styles.jokerButton, floatingButtonStyles]}
          onPress={fiftyFifty}
          label="50/50"
        />
        <AnimatedButton
          onPress={secondChance}
          labelStyle={{ color: colors.primary }}
          variant="secondary"
          style={[styles.jokerButton, floatingButtonStyles]}
          label="2X"
        />
        <AnimatedButton
          disabled={changeQuestionJoker === 3}
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
    position: "absolute",
    left: 0,
    top: 0,
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
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
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  points: {
    fontSize: 28,
    color: colors.primary,
    fontFamily: "Blauer",
  },
  question: {
    color: "white",
    fontSize: 28,
    // marginBottom: 36,
    fontWeight: "700",
    fontFamily: "Blauer Bold",
    marginHorizontal: 16,
  },
  jokerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    left: 0,
    paddingTop: 48,
    width: Dimensions.get("screen").width,
  },
});
