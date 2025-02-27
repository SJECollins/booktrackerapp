import PageView from "@/components/pageView";
import { HeadText, RegText } from "@/components/textElements";
import { getBookById, deleteBook } from "@/lib/db";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "react-native-paper";
import { useMessage } from "@/app/_layout";
import { View } from "react-native";

// Delete book component
export default function DeleteBook() {
  const { id } = useLocalSearchParams();
  const book = getBookById(Number(id));
  const { triggerMessage } = useMessage();

  // Delete the book, confirm to user, and redirect to books list
  const handleDeleteBook = () => {
    deleteBook(Number(id));
    router.push("/books");
    triggerMessage("Book deleted", "success");
  };

  return (
    <PageView>
      <HeadText text="Delete Book" />
      <RegText text="Are you sure you want to delete this book?" />
      {book ? (
        <RegText text={`${book.title} by ${book.authorName}`} />
      ) : (
        <RegText text="Book not found" />
      )}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button
          onPress={handleDeleteBook}
          mode="contained"
          style={{ marginTop: 10 }}
        >
          Delete
        </Button>
        <Button
          onPress={() => router.push("/books")}
          mode="outlined"
          style={{ marginTop: 10 }}
        >
          Cancel
        </Button>
      </View>
    </PageView>
  );
}
