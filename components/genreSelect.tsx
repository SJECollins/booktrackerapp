import React, { useState } from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { Text, TextInput, Chip, useTheme } from "react-native-paper";

interface Genre {
  id: number;
  name: string;
}

interface MultiGenreSelectorProps {
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;
  availableGenres: Genre[];
}

export default function MultiGenreSelector({
  selectedGenres,
  onGenresChange,
  availableGenres,
}: MultiGenreSelectorProps) {
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredGenres, setFilteredGenres] = useState<Genre[]>([]);

  const handleGenreSearch = (text: string) => {
    setSearchText(text);

    const matches = availableGenres.filter(
      (genre) =>
        genre.name.toLowerCase().includes(text.toLowerCase()) &&
        !selectedGenres.includes(genre.name)
    );

    setFilteredGenres(matches);
    setShowDropdown(matches.length > 0);
  };

  const handleGenreSelect = (genre: Genre | string) => {
    const genreName = typeof genre === "string" ? genre : genre.name;

    if (!selectedGenres.includes(genreName)) {
      onGenresChange([...selectedGenres, genreName]);
    }

    setSearchText("");
    setShowDropdown(false);
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    onGenresChange(
      selectedGenres.filter((genre: string) => genre !== genreToRemove)
    );
  };

  return (
    <View style={{ width: "100%" }}>
      <TextInput
        label="Add Genre"
        value={searchText}
        onChangeText={handleGenreSearch}
        onSubmitEditing={() => {
          if (searchText.trim()) {
            handleGenreSelect(searchText.trim());
          }
        }}
        style={{ marginTop: 10 }}
        right={
          showDropdown && (
            <TextInput.Icon
              icon="close"
              onPress={() => {
                setShowDropdown(false);
                setSearchText("");
              }}
            />
          )
        }
      />

      {showDropdown && filteredGenres.length > 0 && (
        <FlatList
          data={filteredGenres}
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
              onPress={() => handleGenreSelect(item)}
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

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {selectedGenres.map((genre) => (
          <Chip
            key={genre}
            onClose={() => handleRemoveGenre(genre)}
            style={{ marginTop: 5 }}
          >
            {genre}
          </Chip>
        ))}
      </View>
    </View>
  );
}
