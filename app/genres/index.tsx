import HeadText from "@/components/headText";
import RegText from "@/components/regText";
import LinkText from "@/components/linkText";
import { getGenres, Genre } from "../../lib/db";
import PageView from "@/components/pageView";
import { useMessage } from "../_layout";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Dropdown } from "react-native-paper-dropdown";
import { useTheme, Text, Button } from "react-native-paper";
import { View } from "react-native";

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name" },
  { label: "Name (Z-A)", value: "nameRev" },
];

// Display all genres
export default function Genres() {
  const theme = useTheme();
  const { triggerMessage } = useMessage();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [sort, setSort] = useState<string>();

  // Load genres
  async function loadGenres() {
    try {
      const fetchedGenres = await getGenres();
      setGenres(fetchedGenres);
    } catch (err) {
      console.error(err);
      triggerMessage("Error loading genres", "error");
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadGenres();
    }, [])
  );

  useEffect(() => {
    let result = [...genres];

    // Apply sorting
    switch (sort) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameRev":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    setGenres(result);
  }, [sort]);

  const handleReset = () => {
    setSort("name");
  };

  return (
    <PageView>
      <HeadText text="All Genres" />
      <RegText text="Click on a genre to view its books." />
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

      {genres.length === 0 && <RegText text="No genres found" />}
      {genres.map((genre) => (
        <LinkText key={genre.id} to={`/genres/${genre.id}`}>
          {genre.name}
        </LinkText>
      ))}
    </PageView>
  );
}
