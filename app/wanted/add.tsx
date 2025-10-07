import {
  KeyboardAvoidingView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { HeadText } from "@/components/textElements";
import { Button, TextInput, useTheme } from "react-native-paper";
import { useMessage } from "../_layout";
import { addWantedBook, Wanted, getAuthors, Author, addAuthor } from "@/lib/db";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import PageView from "@/components/pageView";

export default function AddWanted() {
  const theme = useTheme();
  const { triggerMessage } = useMessage();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState<Author | null>(null);
  const [authorInput, setAuthorInput] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  async function loadAuthors() {
    try {
      const fetchedAuthors = await getAuthors();
      setAuthors(fetchedAuthors);
      setFilteredAuthors(fetchedAuthors);
    } catch (err) {
      console.error(err);
      triggerMessage("Error loading authors", "error");
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadAuthors();
    }, [])
  );

  const handleAuthorChange = (text: string) => {
    setAuthorInput(text);
    setAuthor(null);

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
    setAuthor(author);
    setAuthorInput(author.name);
    setShowDropdown(false);
  };

  // Handle adding a wanted book
  async function handleAddWanted() {
    if (!title.trim()) {
      triggerMessage("Title is required", "error");
      return;
    }

    let authorId = author ? author.id : null;
    const existingAuthor = authors.find((a) => a.name === authorInput.trim());

    if (existingAuthor) {
      authorId = existingAuthor.id;
    } else if (authorInput.trim()) {
      addAuthor(authorInput.trim());
      const newAuthorID = getAuthors().find(
        (a) => a.name === authorInput.trim()
      )?.id;
      if (newAuthorID) {
        authorId = newAuthorID ?? null;
      }
    } else {
      authorId = null;
    }

    try {
      await addWantedBook(title, authorId);
      triggerMessage("Wanted book added successfully", "success");
      router.push("/wanted");
    } catch (err) {
      console.error(err);
      triggerMessage("Error adding wanted book", "error");
    }
  }

  return (
    <PageView>
      <HeadText text="Add Wanted Book" />
      <KeyboardAvoidingView
        behavior="height"
        style={{ flex: 1, width: "100%" }}
      >
        <View style={{ padding: 20 }}>
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            style={{ marginBottom: 10 }}
          />
          <View style={{ width: "100%", zIndex: 1 }}>
            <TextInput
              label="Author"
              value={authorInput}
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
              <View
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
              >
                {filteredAuthors.map((item) => (
                  <TouchableOpacity
                    key={item.id}
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
                ))}
              </View>
            )}
          </View>
          <Button
            mode="contained"
            onPress={handleAddWanted}
            style={{ marginTop: 20 }}
          >
            Add Wanted Book
          </Button>
        </View>
      </KeyboardAvoidingView>
    </PageView>
  );
}
