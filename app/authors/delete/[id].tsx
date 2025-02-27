import PageView from "@/components/pageView";
import { HeadText, RegText } from "@/components/textElements";
import { getAuthorById, deleteAuthor } from "@/lib/db";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "react-native-paper";
import { useMessage } from "@/app/_layout";
import { View } from "react-native";

// Delete author component
export default function DeleteAuthor() {
  const { id } = useLocalSearchParams();
  const author = getAuthorById(Number(id));
  const { triggerMessage } = useMessage();

  const handleDeleteAuthor = () => {
    deleteAuthor(Number(id));
    router.push("/authors");
    triggerMessage("Author deleted", "success");
  };

  return (
    <PageView>
      <HeadText text="Delete Author" />
      <RegText text="Are you sure you want to delete this author?" />
      {author ? (
        <RegText text={`${author.name}`} />
      ) : (
        <RegText text="Author not found" />
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <Button
          onPress={handleDeleteAuthor}
          mode="contained"
          style={{ marginTop: 10 }}
        >
          Delete
        </Button>
        <Button
          onPress={() => router.push("/authors")}
          mode="outlined"
          style={{ marginTop: 10 }}
        >
          Cancel
        </Button>
      </View>
    </PageView>
  );
}
