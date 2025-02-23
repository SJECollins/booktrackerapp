import { Link } from "expo-router";
import { Button as PaperButton } from "react-native-paper";

interface LinkButtonProps {
  title: string;
  href: string;
}

export default function LinkButton({ title, href }: LinkButtonProps) {
  return (
    <Link style={{ marginTop: 10 }} href={href as any}>
      <PaperButton mode="contained" contentStyle={{ height: 40 }}>
        {title}
      </PaperButton>
    </Link>
  );
}
