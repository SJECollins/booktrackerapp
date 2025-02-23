import { Text, useTheme } from "react-native-paper";

export default function RegText({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        fontSize: 16,
        color: theme.colors.onBackground,
        marginBottom: 10,
      }}
    >
      {text}
    </Text>
  );
}
