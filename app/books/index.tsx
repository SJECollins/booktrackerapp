import { useState, useEffect, useCallback } from "react";
import { View } from "react-native";
import { Text, TextInput, useTheme, Button } from "react-native-paper";
import { getBooks, Book } from "../../lib/db";
import LinkButton from "../../components/button";
import RegText from "@/components/regText";
import HeadText from "@/components/headText";
import LinkText from "@/components/linkText";
import { Dropdown } from "react-native-paper-dropdown";
import PageView from "@/components/pageView";
import { useMessage } from "../_layout";
import { router, useFocusEffect } from "expo-router";

// Define sort options for react-native-paper-dropdown
const SORT_OPTIONS = [
  { label: "Title (A-Z)", value: "title" },
  { label: "Title (Z-A)", value: "titleRev" },
  { label: "Author Name (A-Z)", value: "authorName" },
  { label: "Author Name (Z-A)", value: "authorNameRev" },
  { label: "Date Added (Newest)", value: "added" },
  { label: "Date Added (Oldest)", value: "addedRev" },
];

export default function BookList() {
  const theme = useTheme();
  const { triggerMessage } = useMessage();
  const [books, setBooks] = useState<Book[]>([]);
  const [sort, setSort] = useState<string>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);

  // Load initial books
  async function loadBooks() {
    try {
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
    } catch (err) {
      console.error(err);
      triggerMessage("Error loading books", "error");
      router.push("/");
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  // Sort and filter books whenever sort or search changes
  useEffect(() => {
    let result = [...books];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sort) {
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "titleRev":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "authorName":
        result.sort((a, b) =>
          (a.authorName ?? "").localeCompare(b.authorName ?? "")
        );
        break;
      case "authorNameRev":
        result.sort((a, b) =>
          (b.authorName ?? "").localeCompare(a.authorName ?? "")
        );
        break;
      case "addedRev":
        result.sort(
          (a, b) =>
            new Date(b.startedDate).getTime() -
            new Date(a.startedDate).getTime()
        );
        break;
      case "added":
        result.sort(
          (a, b) =>
            new Date(a.startedDate).getTime() -
            new Date(b.startedDate).getTime()
        );
        break;
    }

    setDisplayedBooks(result);
  }, [books, sort, searchQuery]);

  const handleReset = () => {
    setSort("");
    setSearchQuery("");
    setDisplayedBooks(books);
  };

  return (
    <PageView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: 20,
        }}
      >
        <HeadText text="Book Tracker" />
        <LinkButton title="Add Book" href="/books/add" />
      </View>
      <TextInput
        label="Search"
        placeholder="Search books..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        right={<TextInput.Icon icon="magnify" />}
        style={{
          width: "100%",
          height: 50,
          margin: 20,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Dropdown
          label="Sort By"
          value={sort}
          onSelect={setSort}
          options={SORT_OPTIONS}
          placeholder="Sort By"
          menuContentStyle={{
            backgroundColor: theme.colors.background,
            width: 200,
          }}
          CustomDropdownItem={({ option }) => (
            <Text
              style={{
                color: theme.colors.onBackground,
                padding: 10,
              }}
            >
              {option.label}
            </Text>
          )}
        />
        <Button
          mode="outlined"
          onPress={handleReset}
          disabled={!sort && !searchQuery}
          style={{ width: "30%" }}
        >
          Reset
        </Button>
      </View>
      <View
        style={{
          width: "100%",
          padding: 20,
          flex: 1,
        }}
      >
        {displayedBooks.length === 0 ? (
          <RegText text="No books found" />
        ) : (
          displayedBooks.map((book) => (
            <View
              key={book.id}
              style={{
                marginTop: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <LinkText to={`/books/${book.id}`}>{book.title}</LinkText>
              <Text>by {book.authorName}</Text>
            </View>
          ))
        )}
      </View>
    </PageView>
  );
}
