import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import LinkButton from "../components/button";
import { getBooks, Book } from "../lib/db";
import BigHeadText from "@/components/bigHeadText";
import HeadText from "@/components/headText";
import RegText from "@/components/regText";
import LinkText from "@/components/linkText";
import PageView from "@/components/pageView";
import { ScrollView } from "react-native-gesture-handler";

// Home screen component
export default function Index() {
  const theme = useTheme();
  const [books, setBooks] = useState<Book[]>([]);

  const loadBooks = async () => {
    const fetchedBooks = await getBooks();
    setBooks(fetchedBooks);
  };

  // useFocusEffect runs when screen is focused - helps with lagging data updates
  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  // Helper functions to get stats
  const getLastFinished = () => {
    return (
      books
        .filter((book) => book.status === "finished" && book.finishedDate)
        .sort(
          (a, b) =>
            (new Date(b.finishedDate).getTime() || 0) -
            (new Date(a.finishedDate).getTime() || 0)
        )[0] || null
    );
  };

  const getLastAdded = () => {
    return (
      books.sort((a, b) => {
        const dateA = new Date(a.added);
        const dateB = new Date(b.added);

        return dateB.getTime() - dateA.getTime();
      })[0] || null
    );
  };

  const getHighestRated = () => {
    const highestRating = Math.max(...books.map((book) => book.rating || 0), 0);
    return books.filter((book) => book.rating === highestRating);
  };

  const getFavouriteAuthor = () => {
    const authorCounts = books.reduce((counts, book) => {
      if (book.authorName) {
        counts[book.authorName] = (counts[book.authorName] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);

    return (
      Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"
    );
  };

  const getFavouriteGenre = () => {
    const genreCounts = books.reduce((counts, book) => {
      if (book.genres) {
        book.genres.forEach((genre) => {
          counts[genre] = (counts[genre] || 0) + 1;
        });
      }
      return counts;
    }, {} as Record<string, number>);
    return (
      Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"
    );
  };

  const numberReadThisMonth = () => {
    const now = new Date();
    return books.filter(
      (book) =>
        book.status === "finished" &&
        new Date(book.finishedDate || 0).getMonth() === now.getMonth() &&
        new Date(book.finishedDate || 0).getFullYear() === now.getFullYear()
    ).length;
  };

  const numberReadLastMonth = () => {
    const now = new Date();
    return books.filter(
      (book) =>
        book.status === "finished" &&
        new Date(book.finishedDate || 0).getMonth() === now.getMonth() - 1 &&
        new Date(book.finishedDate || 0).getFullYear() === now.getFullYear()
    ).length;
  };

  const numberReadThisYear = () => {
    const now = new Date();
    return books.filter(
      (book) =>
        book.status === "finished" &&
        new Date(book.finishedDate || 0).getFullYear() === now.getFullYear()
    ).length;
  };

  const numberReadLastYear = () => {
    const now = new Date();
    return books.filter(
      (book) =>
        book.status === "finished" &&
        new Date(book.finishedDate || 0).getFullYear() === now.getFullYear() - 1
    ).length;
  };

  const bestMonth = () => {
    const monthCounts = books.reduce((counts, book) => {
      if (book.status === "finished" && book.finishedDate) {
        const date = new Date(book.finishedDate);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`; // Convert to human-readable format
        counts[monthYear] = (counts[monthYear] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);

    const result = Object.entries(monthCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    if (!result) return "None";

    const [month, year] = result.split("/");
    const monthName = new Date(
      parseInt(year),
      parseInt(month) - 1
    ).toLocaleString("en-US", { month: "long" });

    return `${monthName} ${year}`;
  };

  const bestYear = () => {
    const yearCounts = books.reduce((counts, book) => {
      if (book.status === "finished" && book.finishedDate) {
        const year = new Date(book.finishedDate).getFullYear();
        counts[year] = (counts[year] || 0) + 1;
      }
      return counts;
    }, {} as Record<number, number>);

    const result = Object.entries(yearCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    return result ? result.toString() : "None";
  };

  return (
    <PageView>
      <BigHeadText text="Book Tracker" />
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <LinkButton title="Add Book" href="/books/add" />
        <LinkButton title="All Books" href="/books" />
      </View>

      <View
        style={{
          alignItems: "center",
        }}
      >
        <BigHeadText text="Stats!" />
      </View>
      <ScrollView style={{ width: "90%", flex: 1 }}>
        <View
          style={{
            alignItems: "center",
          }}
        >
          <HeadText text="Latest Stuff:" />
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <RegText text="Currently Reading:" />
          {books.filter((book) => book.status === "reading").length > 0 ? (
            books
              .filter((book) => book.status === "reading")
              .map((book) => (
                <LinkText key={book.id} to={`/books/${book.id}`}>
                  {book.title}
                </LinkText>
              ))
          ) : (
            <RegText text="None" />
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <RegText text="Latest Finished:" />
          {getLastFinished() ? (
            <LinkText to={`/books/${getLastFinished()?.id}`}>
              {getLastFinished()?.title}
            </LinkText>
          ) : (
            <RegText text="No books finished yet" />
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <RegText text="Latest Added:" />
          {getLastAdded() ? (
            <LinkText to={`/books/${getLastAdded()?.id}`}>
              {getLastAdded()?.title}
            </LinkText>
          ) : (
            <RegText text="No books added yet" />
          )}
        </View>

        <View
          style={{
            alignItems: "center",
          }}
        >
          <HeadText text="Numbers & Favourites:" />
        </View>

        <View>
          <RegText text={`Total Books Added: ${books.length}`} />
          <RegText
            text={`Total Books Read: ${
              books.filter((book) => book.status === "finished").length
            }`}
          />
          <RegText text={`Read This Month: ${numberReadThisMonth()}`} />
          <RegText text={`Read Last Month: ${numberReadLastMonth()}`} />
          <RegText text={`Read This Year: ${numberReadThisYear()}`} />
          <RegText text={`Read Last Year: ${numberReadLastYear()}`} />
          <RegText text={`Best Month: ${bestMonth()}`} />
          <RegText text={`Best Year: ${bestYear()}`} />
          <RegText
            text={`Total Books Abandoned: ${
              books.filter((book) => book.status === "abandoned").length
            }`}
          />
          <RegText text={`Favourite Author: ${getFavouriteAuthor()}`} />
          <RegText text={`Favourite Genre: ${getFavouriteGenre()}`} />
          <View
            style={{
              alignItems: "center",
            }}
          >
            <HeadText text="Highest Rated Books:" />
          </View>
          {getHighestRated().map((book) => (
            <LinkText key={book.id} to={`/books/${book.id}`}>
              {`${book.title} by ${book.authorName}`}
            </LinkText>
          ))}
          {getHighestRated().length === 0 && (
            <RegText text="No books rated yet" />
          )}
        </View>
      </ScrollView>
    </PageView>
  );
}
