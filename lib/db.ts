import * as SQLite from "expo-sqlite";

// Author interface
export interface Author {
  id: number;
  name: string;
}

// Genre interface
export interface Genre {
  id: number;
  name: string;
}

// Book interface - includes authorName property, that is not present in the database
export interface Book {
  id: number;
  title: string;
  author_id: number | null;
  status: "finished" | "abandoned" | "reading" | "to-read";
  rating: number;
  startedDate: string;
  finishedDate: string;
  link: string;
  notes: string;
  authorName?: string;
  added: string;
  genres?: string[];
}

type BookQueryResult = Book & {
  authorName: string | null;
  genres: string | null;
};

// Function to map database results to Book interface
const mapDbToBook = (
  result: any
): Book & { authorName: string; genres: string[] } => {
  const authorName = result.authorName
    ? result.authorName
    : db.getFirstSync<{ name: string }>(
        `SELECT name FROM authors WHERE id = ?;`,
        [result.author_id]
      )?.name || "Unknown Author";

  const genres =
    result.genres && Array.isArray(result.genres)
      ? result.genres
      : db
          .getAllSync<{ name: string }>(
            `SELECT genres.name 
             FROM genres 
             WHERE genres.id IN (SELECT genre_id FROM book_genres WHERE book_id = ?);`,
            [result.id]
          )
          ?.map((genre) => genre.name) || ["Unknown Genre"];

  return {
    id: result.id,
    title: result.title,
    author_id: result.author_id,
    authorName,
    status: result.status,
    rating: result.rating,
    startedDate: result.startedDate,
    finishedDate: result.finishedDate,
    link: result.link,
    notes: result.notes,
    added: result.added,
    genres,
  };
};

// Open the database (openDatabase deprecated)
const db = SQLite.openDatabaseSync("books.db");

// Function to setup the database
export const setupDatabase = () => {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author_id INTEGER,
      status TEXT CHECK(status IN ('finished', 'abandoned', 'reading', 'to-read')) NOT NULL,
      rating INTEGER CHECK(rating BETWEEN 0 AND 10),
      startedDate TEXT,
      finishedDate TEXT,
      link TEXT,
      notes TEXT,
      added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(author_id) REFERENCES authors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS genres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS book_genres (
      book_id INTEGER,
      genre_id INTEGER,
      PRIMARY KEY (book_id, genre_id),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
    );
    `
  );
};

// Function to get all authors
export const getAuthors = () => {
  return db.getAllSync(`SELECT * FROM authors;`).map(
    (result: any): Author => ({
      id: result.id,
      name: result.name,
    })
  );
};

// Function to get author by id
export const getAuthorById = (id: number): Author => {
  const result = db.getFirstSync<Author>(
    `SELECT * FROM authors WHERE id = ?;`,
    [id]
  );
  if (!result) {
    throw new Error(`Author with id ${id} not found`);
  }
  return result;
};

// Function to add author
export const addAuthor = (name: string) => {
  db.runSync(`INSERT INTO authors (name) VALUES (?);`, [name]);
};

// Function to update author
export const updateAuthor = (id: number, name: string) => {
  db.runSync(`UPDATE authors SET name = ? WHERE id = ?;`, [name, id]);
};

// Function to delete author - dangerous, should consider adding a check for books
export const deleteAuthor = (id: number) => {
  db.runSync(`DELETE FROM authors WHERE id = ?;`, [id]);
};

// Function to get all books with author name
export const getBooks = (): (Book & {
  authorName: string;
  genres: string[];
})[] => {
  const results = db.getAllSync<BookQueryResult>(
    `SELECT books.*, 
            authors.name AS authorName,
            GROUP_CONCAT(genres.name, ', ') AS genres
     FROM books
     LEFT JOIN authors ON books.author_id = authors.id
     LEFT JOIN book_genres ON books.id = book_genres.book_id
     LEFT JOIN genres ON book_genres.genre_id = genres.id
     GROUP BY books.id;`
  );

  return results.map((row) =>
    mapDbToBook({
      ...row,
      authorName: row.authorName || "Unknown Author",
      genres: row.genres ? row.genres.split(", ") : [],
    })
  );
};

// Function to get book by id with author name
export const getBookById = (
  id: number
): (Book & { authorName: string }) | null => {
  const result = db.getFirstSync<BookQueryResult>(
    `SELECT books.*, authors.name AS authorName
     FROM books
     LEFT JOIN authors ON books.author_id = authors.id
     LEFT JOIN book_genres ON books.id = book_genres.book_id
     LEFT JOIN genres ON book_genres.genre_id = genres.id
     WHERE books.id = ?;`,
    [id]
  );
  return result ? mapDbToBook(result) : null;
};

// Function to get books by author id
export const getBooksByAuthorId = (
  id: number
): (Book & { authorName: string })[] => {
  const results = db.getAllSync(
    `SELECT DISTINCT books.*, authors.name AS authorName
     FROM books
     LEFT JOIN authors ON books.author_id = authors.id
     LEFT JOIN book_genres ON books.id = book_genres.book_id
     LEFT JOIN genres ON book_genres.genre_id = genres.id
     WHERE authors.id = ?;`,
    [id]
  );

  return results.map(mapDbToBook);
};

// Function to get books by genre id
export const getBooksByGenreId = (
  id: number
): (Book & { authorName: string })[] => {
  const results = db.getAllSync(
    `SELECT books.*, authors.name AS authorName
     FROM books
     LEFT JOIN authors ON books.author_id = authors.id
     LEFT JOIN book_genres ON books.id = book_genres.book_id
     LEFT JOIN genres ON book_genres.genre_id = genres.id
     WHERE genres.id = ?;`,
    [id]
  );

  return results.map(mapDbToBook);
};

// Function to add book - omit id since it's autoincremented
export const addBook = (book: Omit<Book, "id">) => {
  let result = db.runSync(
    `INSERT INTO books (title, author_id, status, rating, startedDate, finishedDate, link, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      book.title,
      book.author_id,
      book.status,
      book.rating,
      book.startedDate,
      book.finishedDate,
      book.link,
      book.notes,
      book.added,
    ]
  );
  return result.lastInsertRowId;
};

// Function to update book
export const updateBook = (id: number, book: Book) => {
  db.runSync(
    `UPDATE books SET title = ?, author_id = ?, status = ?, rating = ?, startedDate = ?, finishedDate = ?, link = ?, notes = ? WHERE id = ?;`,
    [
      book.title,
      book.author_id,
      book.status,
      book.rating,
      book.startedDate,
      book.finishedDate,
      book.link,
      book.notes,
      id,
    ]
  );
};

// Function to delete book
export const deleteBook = (id: number) => {
  db.runSync(`DELETE FROM books WHERE id = ?;`, [id]);
};

// Function to get a genre by id
export const getGenreById = (id: number): Genre => {
  const result = db.getFirstSync<{ id: number; name: string }>(
    `SELECT id, name FROM genres WHERE id = ?;`,
    [id]
  );
  if (!result) {
    throw new Error(`Genre with id ${id} not found`);
  }
  return { id: result.id, name: result.name };
};

// Function to add genre
export const addGenre = (name: string) => {
  let result = db.runSync(`INSERT INTO genres (name) VALUES (?);`, [name]);
  return result.lastInsertRowId;
};

// Function to update genre
export const updateGenre = (id: number, name: string) => {
  db.runSync(`UPDATE genres SET name = ? WHERE id = ?;`, [name, id]);
};

// Function to delete genre
export const deleteGenre = (id: number) => {
  db.runSync(`DELETE FROM genres WHERE id = ?;`, [id]);
};

// Function to get all genres
export const getGenres = () => {
  return db
    .getAllSync(`SELECT * FROM genres;`)
    .map((result: any): { id: number; name: string } => ({
      id: result.id,
      name: result.name,
    }));
};

// Function to get genres by book id
export const getGenresByBookId = (id: number): Genre[] => {
  return db
    .getAllSync<{ id: number; name: string }>(
      `SELECT genres.id, genres.name 
       FROM genres 
       WHERE genres.id IN (SELECT genre_id FROM book_genres WHERE book_id = ?);`,
      [id]
    )
    .map((result) => ({ id: result.id, name: result.name }));
};

// Function to add genre to book
export const addGenreToBook = (bookId: number, genreId: number) => {
  console.log(bookId, genreId);
  db.runSync(`INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?);`, [
    bookId,
    genreId,
  ]);
};

// Reset the database tables
export const resetDatabaseTables = () => {
  db.execSync(
    `DROP TABLE IF EXISTS book_genres;
     DROP TABLE IF EXISTS books;
     DROP TABLE IF EXISTS authors;
     DROP TABLE IF EXISTS genres; 
    `
  );
  setupDatabase(); // Recreate tables
};

// Export the database content
export const exportDatabase = () => {
  const data = {
    authors: getAuthors(),
    genres: getGenres(),
    books: getBooks(),
  };
  const json = JSON.stringify(data, null, 2);
  return json;
};
