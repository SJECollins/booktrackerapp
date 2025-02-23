import { Link } from "expo-router";
import { Text, useTheme } from "react-native-paper";
import { View } from "react-native";

export default function LinkText({
  to,
  children,
}: {
  to: string;
  children: string;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        marginBottom: 10,
      }}
    >
      <Link href={to as any}>
        <Text
          style={{
            fontSize: 16,
            color: theme.colors.primary,
          }}
        >
          {children}
        </Text>
      </Link>
    </View>
  );
}
