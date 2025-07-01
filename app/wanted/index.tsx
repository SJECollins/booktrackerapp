import {
  HeadText,
  LinkText,
  RegText,
  LinkButton,
  SmallText,
} from "@/components/textElements";
import { getWanted, Wanted, getAuthorById } from "../../lib/db";
import PageView from "@/components/pageView";
import { useMessage } from "../_layout";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Dropdown } from "react-native-paper-dropdown";
import { useTheme, Text, Button } from "react-native-paper";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const SORT_OPTIONS = [
  { label: "Title (A-Z)", value: "title" },
  { label: "Title (Z-A)", value: "titleRev" },
];

export default function WantedList() {
  const theme = useTheme();
  const { triggerMessage } = useMessage();
  const [wanted, setWanted] = useState<Wanted[]>([]);
  const [sort, setSort] = useState<string>();

  // Load wanted books
  async function loadWanted() {
    try {
      const fetchedWanted = await getWanted();
      setWanted(fetchedWanted);
    } catch (err) {
      console.error(err);
      triggerMessage("Error loading wanted books", "error");
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadWanted();
    }, [])
  );

  useEffect(() => {
    let result = [...wanted];

    // Apply sorting
    switch (sort) {
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "titleRev":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    setWanted(result);
  }, [sort]);

  const handleReset = () => {
    setSort("");
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
        <HeadText text="Wanted Books" />
        <LinkButton title="Add Wanted" href="/wanted/add" />
      </View>
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
      </View>
      <Button
        mode="outlined"
        onPress={handleReset}
        disabled={!sort}
        style={{ width: "40%", marginVertical: 20 }}
      >
        Reset
      </Button>
      {wanted.length === 0 ? (
        <RegText text="No wanted books found" />
      ) : (
        <>
          <SmallText text={`Showing ${wanted.length} wanted books`} />
          <ScrollView
            style={{
              width: "100%",
              paddingHorizontal: 20,
              paddingBottom: 20,
              flex: 1,
            }}
          >
            {wanted.map((book) => (
              <LinkText key={book.id} to={`/wanted/${book.id}`}>
                {`${book.title}`}
              </LinkText>
            ))}
          </ScrollView>
        </>
      )}
    </PageView>
  );
}
