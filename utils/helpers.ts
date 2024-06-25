import { TriviaQuestion } from './types';
import { triviaQuestions } from '@/assets/questions';

export function getRandomQuestions(count: number): TriviaQuestion[] {
  const shuffled = triviaQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
