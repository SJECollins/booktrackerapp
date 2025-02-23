import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Button } from "react-native-paper";
import { View } from "react-native";
import BigHeadText from "@/components/bigHeadText";
import { getBookById, updateBook, Book } from "@/lib/db";
import StarRating from "react-native-star-rating-widget";
import { useCallback, useState } from "react";
import { useMessage } from "@/app/_layout";
import PageView from "@/components/pageView";

export default function RateBook() {
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();
  const [book, setBook] = useState<Book | null>(null);
  const [rating, setRating] = useState(0);

  async function loadBook() {
    if (!id) return;
    const fetchedBook = await getBookById(parseInt(id[0]));
    setBook(fetchedBook);
  }

  useFocusEffect(
    useCallback(() => {
      loadBook();
    }, [id])
  );

  const handleSaveBook = () => {
    if (!book) return;
    updateBook(book.id, {
      ...book,
      rating: Math.round(rating * 2),
    });
    triggerMessage("Book rated!", "success");
    router.back();
  };

  return (
    <PageView>
      <BigHeadText text="Rate Book" />
      <View>
        <StarRating rating={rating} onChange={setRating} />
        <Button mode="contained" onPress={handleSaveBook}>
          Rate
        </Button>
      </View>
    </PageView>
  );
}
