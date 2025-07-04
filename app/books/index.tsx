import { useState, useEffect, useCallback } from "react";
import { View } from "react-native";
import { Text, TextInput, useTheme, Button } from "react-native-paper";
import { getBooks, Book } from "../../lib/db";
import {
  HeadText,
  RegText,
  LinkText,
  LinkButton,
  SmallText,
} from "@/components/textElements";
import { Dropdown } from "react-native-paper-dropdown";
import PageView from "@/components/pageView";
import { useMessage } from "../_layout";
import { router, useFocusEffect } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";

// Define sort options for react-native-paper-dropdown
const SORT_OPTIONS = [
  { label: "Title (A-Z)", value: "title" },
  { label: "Title (Z-A)", value: "titleRev" },
  { label: "Author Name (A-Z)", value: "authorName" },
  { label: "Author Name (Z-A)", value: "authorNameRev" },
  { label: "Date Added (Newest)", value: "added" },
  { label: "Date Added (Oldest)", value: "addedRev" },
  { label: "Date Finished (Newest)", value: "finished" },
  { label: "Date Finished (Oldest)", value: "finishedRev" },
];

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Read", value: "read" },
  { label: "Unread", value: "unread" },
  { label: "Abandoned", value: "abandoned" },
];

export default function BookList() {
  const theme = useTheme();
  const { triggerMessage } = useMessage();
  const [books, setBooks] = useState<Book[]>([]);
  const [sort, setSort] = useState<string>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<string>();
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
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.authorName ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply filtering
    switch (filter) {
      case "read":
        result = result.filter((book) => book.status === "finished");
        break;
      case "unread":
        result = result.filter(
          (book) => book.status != "finished" && book.status != "abandoned"
        );
        break;
      case "abandoned":
        result = result.filter((book) => book.status === "abandoned");
        break;
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
        result.sort((a, b) => {
          const aLastName = (a.authorName ?? "").split(" ").slice(-1)[0];
          const bLastName = (b.authorName ?? "").split(" ").slice(-1)[0];
          return aLastName.localeCompare(bLastName);
        });
        break;
      case "authorNameRev":
        result.sort((a, b) => {
          const aLastName = (a.authorName ?? "").split(" ").slice(-1)[0];
          const bLastName = (b.authorName ?? "").split(" ").slice(-1)[0];
          return bLastName.localeCompare(aLastName);
        });
        break;
      case "added":
        result.sort(
          (a, b) => new Date(b.added).getTime() - new Date(a.added).getTime()
        );
        break;
      case "addedRev":
        result.sort(
          (a, b) => new Date(a.added).getTime() - new Date(b.added).getTime()
        );
        break;
      case "finished":
        result.sort(
          (a, b) =>
            new Date(b.finishedDate).getTime() -
            new Date(a.finishedDate).getTime()
        );
        break;
      case "finishedRev":
        result.sort(
          (a, b) =>
            new Date(a.finishedDate).getTime() -
            new Date(b.finishedDate).getTime()
        );
        break;
    }

    setDisplayedBooks(result);
  }, [books, sort, filter, searchQuery]);

  const handleReset = () => {
    setSort("");
    setSearchQuery("");
    setFilter("");
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
          justifyContent: "space-around",
        }}
      >
        <Dropdown
          label="Sort"
          value={sort}
          onSelect={(val) => {
            setSort(val);
          }}
          options={SORT_OPTIONS}
          placeholder="Sort By"
          menuContentStyle={{
            backgroundColor: theme.colors.background,
            width: 160,
          }}
          CustomDropdownItem={({ option }) => (
            <Text
              onPress={() => setSort(option.value)}
              style={{
                color: theme.colors.onBackground,
                padding: 10,
              }}
            >
              {option.label}
            </Text>
          )}
        />
        <Dropdown
          label="Filter"
          value={filter}
          onSelect={(val) => {
            setFilter(val);
          }}
          options={FILTER_OPTIONS}
          placeholder="Filter"
          menuContentStyle={{
            backgroundColor: theme.colors.background,
            width: 140,
          }}
          CustomDropdownItem={({ option }) => (
            <Text
              onPress={() => setFilter(option.value)}
              style={{
                color: theme.colors.onBackground,
                padding: 10,
              }}
            >
              {option.label}
            </Text>
          )}
        />
      </View>
      <Button
        mode="outlined"
        onPress={handleReset}
        disabled={!sort && !searchQuery && !filter}
        style={{ width: "40%", marginVertical: 20 }}
      >
        Reset
      </Button>
      <SmallText text={`Showing ${displayedBooks.length} books`} />
      <ScrollView
        style={{
          width: "100%",
          paddingHorizontal: 20,
          paddingBottom: 20,
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
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <LinkText to={`/books/${book.id}`}>{book.title}</LinkText>
              <Text>by {book.authorName}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </PageView>
  );
}
