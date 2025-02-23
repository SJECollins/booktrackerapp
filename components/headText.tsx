import { Text, useTheme } from "react-native-paper";

export default function HeadText({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        fontSize: 20,
        color: theme.colors.onBackground,
        marginTop: 10,
        marginBottom: 10,
      }}
    >
      {text}
    </Text>
  );
}
