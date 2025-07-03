declare module "@/lib/data/authors.json" {
  interface Author {
    name: string;
    imageUrl: string;
  }

  interface AuthorsData {
    authors: Author[];
  }

  const value: AuthorsData;
  export default value;
}
