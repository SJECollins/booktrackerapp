import HeadText from "@/components/headText";
import RegText from "@/components/regText";
import LinkText from "@/components/linkText";
import { getGenreById, getBooksByGenreId, Genre, Book } from "../../lib/db";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import PageView from "@/components/pageView";
import { View } from "react-native";
import { useMessage } from "../_layout";
import { useCallback, useState } from "react";
import LinkButton from "@/components/button";

// Display a genre and its books
export default function GenreDetails() {
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const [genre, setGenre] = useState<Genre | null>(null);
  const [books, setBooks] = useState<Book[]>([]);

  async function loadData() {
    try {
      if (!id) {
        triggerMessage("Genre ID not provided", "error");
        router.push("/genres");
        return;
      }

      const genreId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
      const fetchedGenre = await getGenreById(genreId);

      if (!fetchedGenre) {
        triggerMessage("Genre not found", "error");
        router.push("/genres");
      } else {
        setGenre(fetchedGenre);
        const fetchedBooks = await getBooksByGenreId(genreId);
        setBooks(fetchedBooks);
      }
    } catch (err) {
      triggerMessage("Error loading genre", "error");
      router.push("/genres");
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  if (isLoading) {
    return <RegText text="Loading..." />;
  }

  if (!genre) {
    return <RegText text="Genre not found" />;
  }

  return (
    <PageView>
      {genre && <HeadText text={genre.name} />}
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        <LinkButton href={`/genres/edit/${genre.id}`} title="Edit" />
        {books.length === 0 && (
          <LinkButton href={`/genres/delete/${genre.id}`} title="Delete" />
        )}
      </View>

      <HeadText text="Books:" />
      <RegText text="Click on a book to view its details." />

      {books.length === 0 ? (
        <RegText text="No books found for this genre." />
      ) : (
        <>
          <HeadText text="Read:" />
          {books
            .filter((book) => {
              return book.status === "finished";
            })
            .map((book) => (
              <LinkText key={book.id} to={`/books/${book.id}`}>
                {book.title}
              </LinkText>
            ))}

          <HeadText text="Unread:" />
          {books
            .filter((book) => {
              return book.status !== "finished";
            })
            .map((book) => (
              <LinkText key={book.id} to={`/books/${book.id}`}>
                {book.title}
              </LinkText>
            ))}
        </>
      )}
    </PageView>
  );
}
