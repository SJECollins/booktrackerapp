import HeadText from "@/components/headText";
import RegText from "@/components/regText";
import { getGenreById, updateGenre } from "@/lib/db";
import { router, useLocalSearchParams } from "expo-router";
import { Button, TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import PageView from "@/components/pageView";
import { useMessage } from "@/app/_layout";
import { View } from "react-native";

// Edit a genre (could it be possible to make this more reusable?)
export default function EditGenre() {
  const { id } = useLocalSearchParams();
  const [genre, setGenre] = useState("");
  const { triggerMessage } = useMessage();

  useEffect(() => {
    const fetchedGenre = getGenreById(Number(id));
    setGenre(fetchedGenre.name);
  }, [id]);

  const handleSaveGenre = () => {
    updateGenre(Number(id), genre);
    router.push("/genres");
    triggerMessage("Genre updated", "success");
  };

  return (
    <PageView>
      <HeadText text="Edit Genre" />
      <RegText text="Change the name of the genre." />
      <TextInput
        label="Name"
        value={genre}
        onChangeText={(text) => setGenre(text)}
        style={{ marginTop: 10, width: "100%" }}
      />
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
          onPress={handleSaveGenre}
          style={{ marginTop: 10 }}
        >
          Update Genre
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push("/genres")}
          style={{ marginTop: 10 }}
        >
          Cancel
        </Button>
      </View>
    </PageView>
  );
}
