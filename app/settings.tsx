import { Button } from "react-native-paper";
import { useAppTheme } from "./_layout";
import {
  resetDatabaseTables,
  exportDatabase,
  Author,
  Genre,
  Book,
} from "../lib/db";
import { HeadText } from "@/components/textElements";
import PageView from "@/components/pageView";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useMessage } from "./_layout";

const convertToCSV = (data: any) => {
  // Create separate CSV files for each table
  const authorsCSV: string = [
    ["id", "name"].join(","), // Header
    ...data.authors.map((author: Author) => [author.id, author.name].join(",")),
  ].join("\n");

  const booksCSV: string = [
    [
      "id",
      "title",
      "authorId",
      "status",
      "rating",
      "startedDate",
      "finishedDate",
      "link",
      "notes",
      "authorName",
      "added",
      "genres",
    ].join(","), // Header
    ...data.books.map((book: Book) =>
      [
        book.id,
        book.title,
        book.author_id,
        book.status,
        book.rating,
        book.startedDate,
        book.finishedDate,
        book.link,
        book.notes,
        book.authorName,
        book.added,
        book.genres,
      ].join(",")
    ),
  ].join("\n");

  const genresCSV = [
    ["id", "name"].join(","), // Header
    ...data.genres.map((genre: Genre) => [genre.id, genre.name].join(",")),
  ].join("\n");

  return {
    authors: authorsCSV,
    books: booksCSV,
    genres: genresCSV,
  };
};

// Settings screen component
export default function Settings() {
  const { darkMode, toggleTheme } = useAppTheme();
  const { triggerMessage } = useMessage();

  // Export database as JSON or CSV - why would I do this to myself?
  const handleExportDatabase = async (format: "json" | "csv") => {
    try {
      const data = exportDatabase();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      if (format === "json") {
        const fileName = `database-export-${timestamp}.json`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, data);

        await Sharing.shareAsync(filePath, {
          mimeType: "application/json",
          dialogTitle: "Export Database (JSON)",
        });
      } else {
        const csvData = convertToCSV(JSON.parse(data));

        // Export each table as separate CSV file
        for (const [table, content] of Object.entries(csvData)) {
          const fileName = `${table}-export-${timestamp}.csv`;
          const filePath = `${FileSystem.documentDirectory}${fileName}`;
          await FileSystem.writeAsStringAsync(filePath, content);

          await Sharing.shareAsync(filePath, {
            mimeType: "text/csv",
            dialogTitle: `Export ${table} (CSV)`,
          });
        }
      }
    } catch (error) {
      console.error(error);
      triggerMessage("Failed to export database", "error");
    }
  };

  return (
    <PageView>
      <HeadText text="Settings" />
      <Button
        mode="outlined"
        onPress={resetDatabaseTables}
        style={{ marginTop: 20 }}
      >
        Reset Database
      </Button>
      <Button
        mode="outlined"
        onPress={() => handleExportDatabase("json")}
        style={{ marginTop: 20 }}
      >
        Export as JSON
      </Button>
      <Button
        mode="outlined"
        onPress={() => handleExportDatabase("csv")}
        style={{ marginTop: 20 }}
      >
        Export as CSV
      </Button>
      <Button mode="outlined" onPress={toggleTheme} style={{ marginTop: 20 }}>
        Toggle Dark Mode ({darkMode ? "Dark" : "Light"})
      </Button>
    </PageView>
  );
}
