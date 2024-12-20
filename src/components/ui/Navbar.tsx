// src/components/ui/Navbar.tsx
import { Sun, Moon } from "lucide-react";
import TabViewer from "@components/ui/TabViewer";
import { useDarkMode } from "@hooks/useDarkMode";

interface NavbarProps {
  activeResolution: string;
  onResolutionChange: (resolution: string) => void;
}

const tabs = [
  { id: "2160p", label: "2160p" },
  { id: "1080p", label: "1080p" },
  { id: "720p", label: "720p" },
  { id: "SD", label: "SD" },
];

const Navbar = ({ activeResolution, onResolutionChange }: NavbarProps) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-8">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              Release Group Database
            </h1>
          </div>

          <div className="flex items-center">
            <TabViewer
              tabs={tabs}
              activeTab={activeResolution}
              onTabChange={onResolutionChange}
            />
          </div>

          <div className="flex-1 flex justify-end">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
