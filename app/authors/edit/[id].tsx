import { HeadText, RegText } from "@/components/textElements";
import { getAuthorById, updateAuthor } from "@/lib/db";
import { router, useLocalSearchParams } from "expo-router";
import { Button, TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import PageView from "@/components/pageView";
import { useMessage } from "@/app/_layout";
import { View } from "react-native";

// Edit author component
export default function EditAuthor() {
  const { id } = useLocalSearchParams();
  const [author, setAuthor] = useState("");
  const { triggerMessage } = useMessage();

  useEffect(() => {
    const fetchedAuthor = getAuthorById(Number(id));
    setAuthor(fetchedAuthor.name);
  }, [id]);

  const handleSaveAuthor = () => {
    updateAuthor(Number(id), author);
    router.push("/authors");
    triggerMessage("Author updated", "success");
  };

  return (
    <PageView>
      <HeadText text="Edit Author" />
      <RegText text="Change the name of the Author." />
      <TextInput
        label="Name"
        value={author}
        onChangeText={(text) => setAuthor(text)}
        style={{ marginTop: 10, width: "100%" }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
          width: "100%",
        }}
      >
        <Button
          mode="contained"
          onPress={handleSaveAuthor}
          style={{ marginTop: 10 }}
        >
          Update Author
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push("/authors")}
          style={{ marginTop: 10 }}
        >
          Cancel
        </Button>
      </View>
    </PageView>
  );
}
