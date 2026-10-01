import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import Navbar from "../components/Navbar";
import CreatePost from "../components/CreatePost";
import ShowPost from "../components/ShowPost";
import DonorSearch from "../components/DonorSearch";
import PostFilter from "../components/PostFilter";
import { usePostStore } from "../stores/usePostStore";

const Home = () => {
  const [showFilter, setShowFilter] = useState(false);
  const activeFilter = usePostStore((s) => s.activeFilter);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      {/* Stacked on phones, feed + sidebar side by side on large screens */}
      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
        <section className="min-w-0">
          <CreatePost />
          <div className="flex items-center justify-between mt-8 mb-4">
            <h1 className="text-2xl font-bold">Blood requests</h1>
            <button
              onClick={() => setShowFilter((v) => !v)}
              className={`btn btn-sm ${showFilter || activeFilter ? "btn-primary" : "btn-outline"}`}
              aria-expanded={showFilter}
            >
              <SlidersHorizontal size={16} aria-hidden="true" /> Filter
            </button>
          </div>
          {showFilter && <PostFilter />}
          <ShowPost />
        </section>
        <aside className="lg:sticky lg:top-20 self-start">
          <DonorSearch />
        </aside>
      </main>
    </div>
  );
};

export default Home;
