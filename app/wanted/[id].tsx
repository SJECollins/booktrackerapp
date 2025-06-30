import { HeadText, RegText, LinkButton } from "@/components/textElements";
import { getWantedById, Wanted, Author, getAuthorById } from "../../lib/db";
import PageView from "@/components/pageView";
import { useMessage } from "../_layout";
import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function WantedDetail() {
  const { id } = useLocalSearchParams();
  const { triggerMessage } = useMessage();
  const [wanted, setWanted] = useState<Wanted | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load wanted book details
  async function loadWanted() {
    try {
      if (!id) {
        triggerMessage("Wanted ID not provided", "error");
        return;
      }

      const wantedId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
      const fetchedWanted = await getWantedById(wantedId);

      if (!fetchedWanted) {
        triggerMessage("Wanted book not found", "error");
      } else {
        setWanted(fetchedWanted);
      }

      // Load author details if available
      if (fetchedWanted.author_id) {
        const fetchedAuthor = await getAuthorById(fetchedWanted.author_id);
        if (fetchedAuthor) {
          setAuthor(fetchedAuthor);
        } else {
          triggerMessage("Author not found", "error");
        }
      }
    } catch (err) {
      triggerMessage("Error loading wanted book", "error");
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadWanted();
    }, [id])
  );

  if (isLoading) {
    return <RegText text="Loading..." />;
  }

  if (!wanted) {
    return <RegText text="Wanted book not found" />;
  }

  return (
    <PageView>
      <HeadText text={wanted.title} />
      <View style={{ padding: 20 }}>
        <RegText text={`Author: ${author}`} />
      </View>
      <RegText text="This book is on your wanted list." />
      <View style={{ padding: 20 }}>
        <LinkButton
          title="Delete Wanted"
          href={`/wanted/delete/${wanted.id}`}
        />
        <LinkButton title="Wanted List" href="/wanted" />
      </View>
    </PageView>
  );
}
