import PageView from "@/components/pageView";
import { HeadText, RegText } from "@/components/textElements";
import { getWantedById, deleteWantedBook } from "@/lib/db";
import { useMessage } from "@/app/_layout";
import { Button } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

// Delete wanted book component
export default function DeleteWanted() {
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();
  const wanted = getWantedById(Number(id));

  const handleDeleteWanted = () => {
    if (wanted) {
      deleteWantedBook(Number(id));
      router.push("/wanted");
      triggerMessage("Wanted book deleted", "success");
    } else {
      triggerMessage("Wanted book not found", "error");
    }
  };

  return (
    <PageView>
      <HeadText text="Delete Wanted Book" />
      <RegText text="Are you sure you want to delete this wanted book?" />
      {wanted ? (
        <RegText text={`${wanted.title}`} />
      ) : (
        <RegText text="Wanted book not found" />
      )}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <Button
          onPress={handleDeleteWanted}
          mode="contained"
          style={{ marginTop: 10 }}
        >
          Delete
        </Button>
        <Button
          onPress={() => router.push("/wanted")}
          mode="outlined"
          style={{ marginTop: 10 }}
        >
          Cancel
        </Button>
      </View>
    </PageView>
  );
}
