import { Text, useTheme, Button as PaperButton } from "react-native-paper";
import { View } from "react-native";
import { Link } from "expo-router";

export function BigHeadText({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        fontSize: 28,
        color: theme.colors.onBackground,
        marginTop: 10,
        marginBottom: 10,
      }}
    >
      {text}
    </Text>
  );
}

export function HeadText({ text }: { text: string }) {
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

export function RegText({ text }: { text: string }) {
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

export function SmallText({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Text
      style={{
        fontSize: 12,
        color: theme.colors.onBackground,
        marginBottom: 10,
      }}
    >
      {text}
    </Text>
  );
}

export function LinkText({ to, children }: { to: string; children: string }) {
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

interface LinkButtonProps {
  title: string;
  href: string;
}

export function LinkButton({ title, href }: LinkButtonProps) {
  return (
    <Link style={{ marginTop: 10 }} href={href as any}>
      <PaperButton mode="contained" contentStyle={{ height: 40 }}>
        {title}
      </PaperButton>
    </Link>
  );
}
