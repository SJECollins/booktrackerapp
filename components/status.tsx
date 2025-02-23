import { useState } from "react";
import { View } from "react-native";
import {
  Button,
  Dialog,
  Portal,
  RadioButton,
  Text,
  useTheme,
} from "react-native-paper";

const STATUS_OPTIONS = ["to-read", "reading", "finished", "abandoned"] as const;

export default function StatusDropdown({
  status,
  setStatus,
}: {
  status: "to-read" | "reading" | "finished" | "abandoned";
  setStatus: (status: "to-read" | "reading" | "finished" | "abandoned") => void;
}) {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  return (
    <View style={{ marginTop: 10 }}>
      <Button mode="outlined" onPress={() => setVisible(true)}>
        {status ? status : "Select Status"}
      </Button>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Select Status</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => {
                setStatus(
                  value as "to-read" | "reading" | "finished" | "abandoned"
                );
                setVisible(false);
              }}
              value={status}
            >
              {STATUS_OPTIONS.map((item) => (
                <View
                  key={item}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <RadioButton value={item} color={theme.colors.primary} />
                  <Text>{item}</Text>
                </View>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}
