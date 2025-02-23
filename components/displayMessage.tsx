import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  error: {
    backgroundColor: "#ffebee",
  },
  success: {
    backgroundColor: "#e8f5e9",
  },
  messageText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
  },
  successText: {
    color: "green",
  },
});

interface DisplayMessageProps {
  messageText: string;
  messageType: "error" | "success";
}

export default function DisplayMessage({
  messageText,
  messageType,
}: DisplayMessageProps) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"error" | "success">("success");

  useEffect(() => {
    setMessage(messageText);
    setType(messageType);
    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [messageText]);

  if (!message) return null;

  return (
    <View
      style={[
        styles.container,
        type === "error" ? styles.error : styles.success,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          type === "error" ? styles.errorText : styles.successText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}
