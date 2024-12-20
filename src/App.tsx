// src/App.tsx
import { useGroups } from "@hooks/useGroups";
import Navbar from "@components/ui/Navbar";
import TierBlock from "@components/TierBlock";
import { useState } from "react";

type Resolution = "2160p" | "1080p" | "720p" | "SD";

function App() {
  const { groups, loading, error } = useGroups();
  const [activeResolution, setActiveResolution] = useState<Resolution>("1080p");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          Error: {error.message}
        </div>
      </div>
    );
  }

  const activeTiers = groups[activeResolution];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar
        activeResolution={activeResolution}
        onResolutionChange={(res) => setActiveResolution(res as Resolution)}
      />
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
        {Object.entries(activeTiers).map(([tier, groupList]) => (
          <TierBlock
            key={tier}
            tier={tier}
            groups={groupList}
            resolution={activeResolution}
          />
        ))}
      </main>
    </div>
  );
}

export default App;
