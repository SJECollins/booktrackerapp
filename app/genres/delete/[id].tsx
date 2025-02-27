import PageView from "@/components/pageView";
import { HeadText, RegText } from "@/components/textElements";
import { getGenreById, deleteGenre } from "@/lib/db";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "react-native-paper";
import { useMessage } from "@/app/_layout";
import { View } from "react-native";

// Delete a genre - mainly to warn the user before deleting
export default function DeleteGenre() {
  const { id } = useLocalSearchParams();
  const genre = getGenreById(Number(id));
  const { triggerMessage } = useMessage();

  const handleDeleteGenre = () => {
    deleteGenre(Number(id));
    router.push("/genres");
    triggerMessage("Genre deleted", "success");
  };

  return (
    <PageView>
      <HeadText text="Delete Genre" />
      <RegText text="Are you sure you want to delete this genre?" />
      {genre ? (
        <RegText text={`${genre.name}`} />
      ) : (
        <RegText text="Genre not found" />
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <Button
          onPress={handleDeleteGenre}
          mode="contained"
          style={{ marginTop: 10 }}
        >
          Delete
        </Button>
        <Button
          onPress={() => router.push("/genres")}
          mode="outlined"
          style={{ marginTop: 10 }}
        >
          Cancel
        </Button>
      </View>
    </PageView>
  );
}
