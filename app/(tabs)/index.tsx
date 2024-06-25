import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Canvas, Fill, vec } from '@shopify/react-native-skia';

import { Text } from '@/components/Themed';
import { colors } from '@/constants/Colors';
import Button from '@/components/Button';
import Timer from '@/components/Timer';
import { useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useGameStore from '@/store/useGameStore';
import { Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');
const center = vec(width / 2, height / 2);

export const { PI } = Math;
export const TAU = 2 * PI;
export const SIZE = width;
export const strokeWidth = 40;

const color = (r: number, g: number, b: number) =>
  `rgb(${r * 255}, ${g * 255}, ${b * 255})`;

const rings = [
  {
    totalProgress: 1.3,
    colors: [color(0.008, 1, 0.659), color(0, 0.847, 1)],
    background: color(0.016, 0.227, 0.212),
    size: SIZE - strokeWidth * 4,
  },
  {
    totalProgress: 0.6,
    colors: [color(0.847, 1, 0), color(0.6, 1, 0.004)],
    background: color(0.133, 0.2, 0),
    size: SIZE - strokeWidth * 2,
  },
  {
    totalProgress: 0.7,
    colors: [color(0.98, 0.067, 0.31), color(0.976, 0.22, 0.522)],
    background: color(0.196, 0.012, 0.063),
    size: SIZE,
  },
];

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const initializeSession = useGameStore(
    (state) => state.initializeSessionQuestions
  );
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 },
      ]}
    >
      {/* <View>
        <Text style={styles.title}>TRIVIA</Text>
        <Text
          style={{
            fontSize: 44,
            color: colors.primary,
            fontFamily: 'KanitBold',
            marginLeft: 32,
            marginBottom: 32,
          }}
        >
          TREASURE
        </Text>
      </View> */}
      <Ionicons size={96} name="game-controller" color={colors.primary} />
      <Text
        style={{
          color: colors.primary,
          fontSize: 46,
          fontFamily: 'Blauer Medium',
        }}
      >
        Trivia Treasure
      </Text>

      <Button
        rounded
        onPress={() => {
          initializeSession();
          navigation.navigate('game');
        }}
        label="Classic"
      />
      <Button
        rounded
        onPress={() => navigation.navigate('game-over')}
        variant="secondary"
        label="Timed"
      />
      <StatusBar barStyle="default" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: colors.backgroud,
    gap: 16,
  },
  title: {
    fontSize: 44,
    color: colors.primary,
    fontFamily: 'KanitBold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
