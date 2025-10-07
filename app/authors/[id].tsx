import {
  HeadText,
  LinkText,
  RegText,
  LinkButton,
} from "@/components/textElements";
import {
  getAuthorById,
  getBooksByAuthorId,
  Book,
  Author,
  Wanted,
  getWantedByAuthorId,
} from "../../lib/db";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import PageView from "@/components/pageView";
import { View } from "react-native";
import { useMessage } from "../_layout";
import { useCallback, useState } from "react";

// Display a author and their books
export default function AuthorDetails() {
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();
  const [isLoading, setIsLoading] = useState(true);
  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [wantedBooks, setWantedBooks] = useState<Wanted[]>([]);

  // Load author and their books
  async function loadData() {
    try {
      if (!id) {
        triggerMessage("Author ID not provided", "error");
        router.push("/authors");
        return;
      }

      const authorId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
      const fetchedAuthor = await getAuthorById(authorId);

      if (!fetchedAuthor) {
        triggerMessage("Author not found", "error");
        router.push("/authors");
      } else {
        setAuthor(fetchedAuthor);
        const fetchedBooks = await getBooksByAuthorId(authorId);
        setBooks(fetchedBooks);
        const fetchedWantedBooks = await getWantedByAuthorId(authorId);
        setWantedBooks(fetchedWantedBooks);
      }
    } catch (err) {
      triggerMessage("Error loading author", "error");
      router.push("/authors");
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

  if (!author) {
    return <RegText text="Book not found" />;
  }

  return (
    <PageView>
      <HeadText text={author.name} />

      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        <LinkButton href={`/authors/edit/${author.id}`} title="Edit" />
        {books.length === 0 && (
          <LinkButton href={`/authors/delete/${author.id}`} title="Delete" />
        )}
      </View>

      <HeadText text="Books:" />
      <RegText text="Click on a book to view its details." />

      {books.length === 0 ? (
        <RegText text="No books found for this author." />
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
              return book.status === "to-read";
            })
            .map((book) => (
              <LinkText key={book.id} to={`/books/${book.id}`}>
                {book.title}
              </LinkText>
            ))}
        </>
      )}
      <HeadText text="Wanted Books:" />
      {wantedBooks.length === 0 ? (
        <RegText text="No wanted books found for this author." />
      ) : (
        wantedBooks.map((wanted) => (
          <LinkText key={wanted.id} to={`/wanted/${wanted.id}`}>
            {wanted.title}
          </LinkText>
        ))
      )}
    </PageView>
  );
}
