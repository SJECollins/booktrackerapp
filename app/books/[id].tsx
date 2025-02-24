import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { getBookById, Book, Genre, getGenresByBookId } from "../../lib/db";
import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import LinkButton from "../../components/button";
import { useMessage } from "../_layout";
import RegText from "@/components/regText";
import HeadText from "@/components/headText";
import PageView from "@/components/pageView";
import LinkText from "@/components/linkText";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import BigHeadText from "@/components/bigHeadText";
import { ScrollView } from "react-native-gesture-handler";

// Display individual book details
export default function BookDetail() {
  const { triggerMessage } = useMessage();
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load the book data
  async function loadBook() {
    try {
      if (!id) {
        triggerMessage("Book ID not provided", "error");
        return;
      }

      const bookId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
      const fetchedBook = await getBookById(bookId);

      if (!fetchedBook) {
        triggerMessage("Book not found", "error");
      } else {
        setBook(fetchedBook);
        setGenres(getGenresByBookId(bookId));
      }
    } catch (err) {
      triggerMessage("Error loading book", "error");
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadBook();
    }, [id])
  );

  const listGenres = book?.genres ? book.genres.join(", ") : "";
  const finishedOn = () => {
    if (book?.finishedDate) {
      return new Date(book.finishedDate).toDateString();
    }
    return "";
  };

  if (isLoading) {
    return <RegText text="Loading..." />;
  }

  if (!book) {
    return <RegText text="Book not found" />;
  }

  return (
    <PageView>
      <BigHeadText text={book.title} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          width: "100%",
          marginBottom: 10,
          marginTop: 10,
        }}
      >
        <LinkButton href={`/books/edit/${book.id}`} title="Edit" />
        <LinkButton href={`/books/delete/${book.id}`} title="Delete" />
      </View>
      <HeadText text="Details: " />
      <ScrollView
        style={{
          width: "100%",
        }}
        contentContainerStyle={{
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            width: "90%",
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          <RegText text="Author: " />
          <LinkText to={`/authors/${book.author_id}`}>
            {book.authorName ?? "Unknown Author"}
          </LinkText>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            width: "90%",
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          <RegText text="Genre(s): " />
          {genres.map((genre) => (
            <LinkText key={genre.id} to={`/genres/${genre.id}`}>
              {`${genre.name}, `}
            </LinkText>
          ))}
        </View>
        <View
          style={{
            width: "90%",
          }}
        >
          <RegText text={`Link: ${book.link}`} />
          <RegText text={`Notes: ${book.notes}`} />
          <RegText text={`Status: ${book.status}`} />
          {book.status === "finished" || book.status === "abandoned" ? (
            <>
              <RegText text={`Finished On: ${finishedOn()}`} />
              <StarRatingDisplay rating={book.rating / 2} />
              <LinkButton
                href={`/books/rate/${book.id}`}
                title="Update Rating"
              />
            </>
          ) : null}
        </View>
      </ScrollView>
    </PageView>
  );
}
