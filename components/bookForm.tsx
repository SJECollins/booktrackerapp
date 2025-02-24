import { FlatList, TouchableOpacity, View } from "react-native";
import {
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  addBook,
  updateBook,
  getBookById,
  Book,
  getAuthors,
  addAuthor,
  getGenres,
  addGenre,
  addGenreToBook,
  Author,
  Genre,
  getGenresByBookId,
} from "../lib/db";
import { useCallback, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMessage } from "@/app/_layout";
import { useFocusEffect, useRouter } from "expo-router";
import HeadText from "./headText";
import PageView from "./pageView";
import MultiGenreSelector from "./genreSelect";
import StarRating from "react-native-star-rating-widget";
import { ScrollView } from "react-native-gesture-handler";

// Constants
const STATUS_OPTIONS: {
  label: string;
  value: "to-read" | "reading" | "finished" | "abandoned";
}[] = [
  { label: "To Read", value: "to-read" },
  { label: "Reading", value: "reading" },
  { label: "Finished", value: "finished" },
  { label: "Abandoned", value: "abandoned" },
];

// Initial state for the book with id removed and authorName added
const initialBookState: Omit<Book, "id"> & { authorName: string } = {
  title: "",
  author_id: null,
  authorName: "",
  status: "to-read",
  rating: 0,
  startedDate: new Date().toISOString(),
  finishedDate: new Date().toISOString(),
  link: "",
  notes: "",
  added: new Date().toISOString(),
  genres: [],
};

// BookForm component for adding and editing books
export default function BookForm({ bookId }: { bookId: string | null }) {
  const { triggerMessage } = useMessage();
  const router = useRouter();
  const theme = useTheme();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openFinishDate, setOpenFinishDate] = useState(false);
  const [rating, setRating] = useState(0);
  const [book, setBook] = useState<Omit<Book, "id"> & { authorName: string }>(
    initialBookState
  );

  // Load book data if bookId is provided; load authors to select from
  async function loadData() {
    if (bookId) {
      try {
        const bookData = await getBookById(
          Array.isArray(bookId) ? parseInt(bookId[0]) : parseInt(bookId)
        );
        if (bookData) {
          const author = getAuthors().find((a) => a.id === bookData.author_id);
          setBook({ ...bookData, authorName: author?.name ?? "" });
        }
      } catch (err) {
        triggerMessage("Error loading book", "error");
      }
    } else {
      setBook(initialBookState);
    }
    const authorList = getAuthors();
    setAuthors(authorList);
    const genreList = getGenres();
    setGenres(genreList);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleStatusSelect = (
    status: "finished" | "abandoned" | "reading" | "to-read"
  ) => {
    setBook({ ...book, status });
    setShowStatusModal(false);
  };

  // Handle author search and selection
  const handleAuthorChange = (text: string) => {
    setBook({ ...book, author_id: null, authorName: text });

    if (text.length === 0) {
      setShowDropdown(false);
      return;
    }

    const matches = authors.filter((author) =>
      author.name.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredAuthors(matches);
    setShowDropdown(matches.length > 0);
  };

  const handleAuthorSelect = (author: Author) => {
    setBook({ ...book, author_id: author.id, authorName: author.name });
    setShowDropdown(false);
  };

  // Handle rating change - need to convert from float to int
  const handleSetRating = (rating: number) => {
    setRating(rating);
    setBook({ ...book, rating: Math.round(rating * 2) });
  };

  // Save book data - add or update, also add author to db if not found
  const handleSave = async () => {
    let authorId = book.author_id;

    const existingAuthor = authors.find(
      (author) => author.name.toLowerCase() === book.authorName.toLowerCase()
    );
    if (existingAuthor) {
      authorId = existingAuthor.id;
    } else {
      if (!book.authorName) {
        triggerMessage("Author name is required", "error");
        return;
      } else {
        addAuthor(book.authorName);
        const newAuthor = getAuthors().find(
          (a) => a.name.toLowerCase() === book.authorName.toLowerCase()
        );
        authorId = newAuthor?.id ?? null;
      }
    }

    if (!authorId) {
      triggerMessage("Author not found", "error");
      return;
    }

    const bookData = {
      ...book,
      author_id: authorId,
    };

    try {
      if (bookId) {
        await updateBook(
          Array.isArray(bookId) ? parseInt(bookId[0]) : parseInt(bookId),
          {
            ...bookData,
            id: Array.isArray(bookId) ? parseInt(bookId[0]) : parseInt(bookId),
          }
        );
        setBook(initialBookState);
        router.navigate("/books");
        triggerMessage("Book updated successfully", "success");

        const existingGenres = getGenresByBookId(
          Array.isArray(bookId) ? parseInt(bookId[0]) : parseInt(bookId)
        );
        const newGenres = book.genres?.filter(
          (genre) =>
            !existingGenres.find(
              (existingGenre) =>
                existingGenre.name.toLowerCase() === genre.toLowerCase()
            )
        );

        await Promise.all(
          (newGenres || []).map(async (genre) => {
            let genreId = genres.find(
              (g) => g.name.toLowerCase() === genre.toLowerCase()
            )?.id;
            if (genreId) {
              const currentBookId = Array.isArray(bookId)
                ? parseInt(bookId[0])
                : parseInt(bookId);
              await addGenreToBook(currentBookId, genreId);
            } else {
              genreId = addGenre(genre);
              const currentBookId = Array.isArray(bookId)
                ? parseInt(bookId[0])
                : parseInt(bookId);
              await addGenreToBook(currentBookId, genreId);
            }
          })
        );
      } else {
        const newBookId: number = await addBook(bookData);
        setBook(initialBookState);
        router.navigate("/books");
        triggerMessage("Book added successfully", "success");

        await Promise.all(
          (book.genres || []).map(async (genre) => {
            let genreId = genres.find(
              (g) => g.name.toLowerCase() === genre.toLowerCase()
            )?.id;
            if (genreId) {
              const currentBookId = newBookId;
              await addGenreToBook(currentBookId, genreId);
            } else {
              genreId = addGenre(genre);
              const currentBookId = newBookId;
              await addGenreToBook(currentBookId, genreId);
            }
          })
        );
      }
    } catch (err) {
      triggerMessage("Error saving book", "error");
    }
  };

  return (
    <PageView>
      <HeadText text={bookId ? "Edit Book" : "Add Book"} />
      <ScrollView
        style={{
          width: "100%",
          flex: 1,
        }}
      >
        <TextInput
          label="Title"
          value={book.title}
          onChangeText={(text) => setBook({ ...book, title: text })}
          style={{ width: "100%", marginTop: 10 }}
        />

        <View style={{ width: "100%", zIndex: 1 }}>
          <TextInput
            label="Author"
            value={book.authorName}
            onChangeText={handleAuthorChange}
            style={{ marginTop: 10 }}
            right={
              showDropdown && (
                <TextInput.Icon
                  icon="close"
                  onPress={() => {
                    setShowDropdown(false);
                    setFilteredAuthors([]);
                  }}
                />
              )
            }
          />

          {showDropdown && filteredAuthors.length > 0 && (
            <FlatList
              data={filteredAuthors}
              keyExtractor={(item) => item.id.toString()}
              style={{
                maxHeight: 150,
                backgroundColor: theme.colors.background,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 2,
                elevation: 3,
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleAuthorSelect(item)}
                  style={{
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outline,
                  }}
                >
                  <Text style={{ color: theme.colors.onBackground }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <MultiGenreSelector
          selectedGenres={book.genres || []}
          onGenresChange={(selectedGenres) => {
            setBook({ ...book, genres: selectedGenres });
          }}
          availableGenres={genres}
        />

        <TouchableOpacity
          style={{ width: "100%" }}
          onPress={() => setShowStatusModal(true)}
        >
          <TextInput
            label="Status"
            value={
              STATUS_OPTIONS.find((option) => option.value === book.status)
                ?.label
            }
            editable={false}
            style={{ marginTop: 10 }}
          />
        </TouchableOpacity>

        <Portal>
          <Modal
            visible={showStatusModal}
            onDismiss={() => setShowStatusModal(false)}
            contentContainerStyle={{
              position: "absolute",
              left: "10%",
              right: "10%",
              backgroundColor: theme.colors.background,
              padding: 20,
              borderRadius: 8,
              elevation: 5,
              top: "30%",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 15,
                  textAlign: "center",
                  color: theme.colors.onBackground,
                }}
              >
                Select Status
              </Text>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleStatusSelect(option.value)}
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outline,
                  }}
                >
                  <Text
                    style={{
                      color:
                        book.status === option.value
                          ? theme.colors.primary
                          : theme.colors.onBackground,
                      fontSize: 16,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Modal>
        </Portal>

        <TextInput
          label="Link"
          value={book.link}
          onChangeText={(text) => setBook({ ...book, link: text })}
          style={{ width: "100%", marginTop: 10 }}
        />

        <TextInput
          label="Notes"
          value={book.notes}
          onChangeText={(text) => setBook({ ...book, notes: text })}
          style={{ width: "100%", marginTop: 10 }}
        />

        {book.status != "to-read" && (
          <>
            <TextInput
              label="Started Date"
              value={new Date(book.startedDate).toDateString()}
              right={
                <TextInput.Icon
                  icon="calendar"
                  onPress={() => setOpenStartDate(true)}
                />
              }
              editable={false}
              style={{ width: "100%", marginTop: 10 }}
            />
            {openStartDate && (
              <DateTimePicker
                mode="date"
                display="default"
                value={new Date(book.startedDate)}
                onChange={(event, selectedDate) => {
                  setOpenStartDate(false);
                  if (selectedDate) {
                    setBook({
                      ...book,
                      startedDate: selectedDate.toISOString(),
                    });
                  }
                }}
              />
            )}
          </>
        )}
        {book.status === "finished" && (
          <>
            <TextInput
              label="Finished Date"
              value={
                book.finishedDate
                  ? new Date(book.finishedDate).toDateString()
                  : ""
              }
              right={
                <TextInput.Icon
                  icon="calendar"
                  onPress={() => setOpenFinishDate(true)}
                />
              }
              editable={false}
              style={{ width: "100%", marginTop: 10 }}
            />
            {openFinishDate && (
              <DateTimePicker
                mode="date"
                display="default"
                value={new Date(book.finishedDate)}
                onChange={(event, selectedDate) => {
                  setOpenFinishDate(false);
                  if (selectedDate) {
                    setBook({
                      ...book,
                      finishedDate: selectedDate.toISOString(),
                    });
                  }
                }}
              />
            )}
          </>
        )}

        {(book.status === "finished" || book.status === "abandoned") && (
          <StarRating rating={rating} onChange={handleSetRating} />
        )}
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
            onPress={handleSave}
            style={{ marginTop: 10 }}
          >
            {bookId ? "Update Book" : "Add Book"}
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.navigate("/books")}
            style={{ marginTop: 10 }}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </PageView>
  );
}
