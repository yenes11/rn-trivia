import { getRandomQuestions } from "@/utils/helpers";
import type { TriviaQuestion } from "@/utils/types";
import { create, StateCreator } from "zustand";
import { AnimationObject } from "react-native-reanimated";
import { triviaQuestions } from "@/assets/questions";
type Display = "none" | "flex" | undefined;

const LottieSourceFalse = require("@/assets/lottie/wrong.json");
const LottieSourceTrue = require("@/assets/lottie/confetti.json");

interface GameSlice {
	totalQuestionCount: number;
	sessionQuestions: TriviaQuestion[];
	selectedAnswer: null | string;
	currentQuestionIndex: number;
	correctLottieDisplay: Display;
	wrongLottieDisplay: Display;
	options: string[];
	optionsDisabled: boolean[];
	points: number;
	fiftyFiftyJoker: 1 | 2 | 3;
	secondChanceJoker: 1 | 2 | 3;
	changeQuestionJoker: 1 | 2 | 3;
	fiftyFifty: () => void;
	changeQuestion: () => void;
	secondChance: () => void;
	initializeSessionQuestions: () => void;
	nextQuestion: () => void;
	selectOption: (answer: string) => void;
	endGame: () => void;
}

const useGameStore = create<GameSlice>((set, get) => ({
	totalQuestionCount: 10,
	sessionQuestions: [],
	selectedAnswer: null,
	points: 0,
	currentQuestionIndex: 0,
	correctLottieDisplay: "none",
	wrongLottieDisplay: "none",
	changeQuestionJoker: 1,
	secondChanceJoker: 1,
	fiftyFiftyJoker: 1,
	initializeSessionQuestions: () => {
		const questions = getRandomQuestions(get().totalQuestionCount);
		const firstQuestion = questions[0];
		const firstQuestionOptions = [
			...firstQuestion.wrongAnswers,
			firstQuestion.correctAnswer,
		].sort(() => 0.5 - Math.random());
		set((state) => ({
			sessionQuestions: questions,
			points: 0,
			selectedAnswer: null,
			currentQuestionIndex: 0,
		}));
		let duration = 200;
		for (const option of firstQuestionOptions) {
			setTimeout(() => {
				set((state) => ({ options: [...state.options, option] }));
			}, duration);
			duration += 200;
		}
	},
	options: [],
	optionsDisabled: [false, false, false, false],
	fiftyFifty: () => {
		const currentQuestion = get().sessionQuestions[get().currentQuestionIndex];
		let deleteCount = 0;
		let duration = 200;
		while (deleteCount < 2) {
			const toBeDeletedIndex = Math.floor(Math.random() * 4 - deleteCount);
			if (get().options[toBeDeletedIndex] === currentQuestion.correctAnswer)
				continue;
			console.log(toBeDeletedIndex);
			deleteCount++;
			setTimeout(() => {
				set((state) => {
					const options = [...state.options];
					options.splice(1, 1);
					return {
						options,
						fiftyFiftyJoker: 3,
					};
				});
			}, duration);
			duration += 200;
		}
	},
	secondChance: () => {
		set({ secondChanceJoker: 2 });
	},
	changeQuestion: () => {
		const sessionQuestionIds = new Set(get().sessionQuestions.map((q) => q.id));

		for (const question of triviaQuestions) {
			if (sessionQuestionIds.has(question.id)) continue;
			set((state) => {
				const sessionQuestions = [...state.sessionQuestions];
				const options = [...question.wrongAnswers, question.correctAnswer].sort(
					() => 0.5 - Math.random(),
				);
				sessionQuestions[state.currentQuestionIndex] = question;
				return { sessionQuestions, options, changeQuestionJoker: 3 };
			});
		}
	},
	nextQuestion: () => {
		const isLastQuestion =
			get().currentQuestionIndex === get().totalQuestionCount - 1;
		set((state) => ({
			correctLottieDisplay: "none",
			wrongLottieDisplay: "none",
			currentQuestionIndex: isLastQuestion
				? state.currentQuestionIndex
				: state.currentQuestionIndex + 1,
			selectedAnswer: null,
		}));
		if (isLastQuestion) return;
		const nextQuestion = get().sessionQuestions[get().currentQuestionIndex];
		const nextQuestionOptions = [
			...nextQuestion.wrongAnswers,
			nextQuestion.correctAnswer,
		].sort(() => 0.5 - Math.random());
		let duration = 200;
		for (const option of nextQuestionOptions) {
			setTimeout(() => {
				set((state) => ({ options: [...state.options, option] }));
			}, duration);
			duration += 200;
		}
	},
	selectOption: (answer: string) => {
		const currentQuestion = get().sessionQuestions[get().currentQuestionIndex];
		const isCorrectAnswer = answer === currentQuestion.correctAnswer;
		const isSecondChance = get().secondChanceJoker === 2;
		set((state) => {
			const newState: Partial<GameSlice> = {
				selectedAnswer: answer,
			};
			if (isCorrectAnswer) {
				newState.correctLottieDisplay = "flex";
				newState.points = state.points + 150;
			}
			if (!isSecondChance) {
				newState.wrongLottieDisplay = "flex";
			} else {
				newState.secondChanceJoker = 3;
			}
			return newState;
		});
		if (isSecondChance && !isCorrectAnswer) {
			return;
		}
		let duration = 200;
		for (let i = 0; i < 4; i++) {
			setTimeout(() => {
				set((state) => ({ options: state.options.slice(0, -1) }));
			}, duration);
			duration += 200;
		}
	},
	endGame: () => {},
}));

export default useGameStore;
