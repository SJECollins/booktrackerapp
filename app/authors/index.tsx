import { HeadText, LinkText, RegText } from "@/components/textElements";
import { getAuthors, Author } from "../../lib/db";
import PageView from "@/components/pageView";
import { useMessage } from "../_layout";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Dropdown } from "react-native-paper-dropdown";
import { View } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name" },
  { label: "Name (Z-A)", value: "nameRev" },
];

// Display all authors
export default function Authors() {
  const theme = useTheme();
  const { triggerMessage } = useMessage();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [sort, setSort] = useState<string>();

  // Load authors
  async function loadAuthors() {
    try {
      const fetchedAuthors = await getAuthors();
      setAuthors(fetchedAuthors);
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

  useEffect(() => {
    let result = [...authors];

    // Apply sorting
    switch (sort) {
      case "name":
        result.sort((a, b) => {
          const aLastName = a.name.split(" ").slice(-1)[0];
          const bLastName = b.name.split(" ").slice(-1)[0];
          return aLastName.localeCompare(bLastName);
        });
        break;
      case "nameRev":
        result.sort((a, b) => {
          const aLastName = a.name.split(" ").slice(-1)[0];
          const bLastName = b.name.split(" ").slice(-1)[0];
          return bLastName.localeCompare(aLastName);
        });
        break;
    }

    setAuthors(result);
  }, [sort]);

  const handleReset = () => {
    setSort("name");
  };

  return (
    <PageView>
      <HeadText text="All Authors" />
      <RegText text="Click on an author to view their books." />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 20,
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
              onPress={() => setSort(option.value)}
            >
              {option.label}
            </Text>
          )}
        />
        <Button
          mode="outlined"
          onPress={handleReset}
          disabled={!sort}
          style={{ width: "30%" }}
        >
          Reset
        </Button>
      </View>
      {authors.length === 0 && <RegText text="No authors found" />}
      <ScrollView
        style={{
          width: "100%",
          paddingHorizontal: 20,
          paddingBottom: 20,
          flex: 1,
        }}
      >
        {authors.map((author) => (
          <LinkText key={author.id} to={`/authors/${author.id}`}>
            {author.name}
          </LinkText>
        ))}
      </ScrollView>
    </PageView>
  );
}
