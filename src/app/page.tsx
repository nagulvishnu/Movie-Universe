import HomeView from "@/components/ui/HomeView";
import { buildCollections } from "@/lib/movies";
import { getMovies } from "@/lib/registry";

export default function HomePage() {
  const movies = getMovies();
  return <HomeView movies={movies} collections={buildCollections(movies)} />;
}
