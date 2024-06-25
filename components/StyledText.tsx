import { Text, TextProps } from './Themed';

export function MonoText(props: TextProps) {
  return (
    <Text
      {...props}
      style={[{ fontFamily: 'SpaceMono', color: 'white' }, props.style]}
    />
  );
}
