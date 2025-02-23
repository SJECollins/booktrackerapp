import { useLocalSearchParams } from "expo-router";
import BookForm from "../../../components/bookForm";

export default function UpdateBook() {
  const { id } = useLocalSearchParams();
  if (!id) return null;
  return <BookForm bookId={Array.isArray(id) ? id[0] : id} />;
}
