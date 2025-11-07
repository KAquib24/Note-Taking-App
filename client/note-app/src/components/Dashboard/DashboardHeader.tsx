import { GridIcon, ListIcon, PlusIcon, SunIcon, MoonIcon } from "../icons";

interface DashboardHeaderProps {
  filteredNotesCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: "date" | "title" | "folder";
  onSortChange: (sort: "date" | "title" | "folder") => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  onNewNote: () => void;
}

export const DashboardHeader = ({
  filteredNotesCount,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  darkMode,
  onDarkModeToggle,
  onNewNote,
}: DashboardHeaderProps) => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-2xl">
      <div className="container mx-auto px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Masterpiece Collection
            </h1>
            <div className="text-lg font-semibold text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-white/20 dark:border-gray-700/30">
              {filteredNotesCount} {filteredNotesCount === 1 ? 'Masterpiece' : 'Masterpieces'}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
            
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "date" | "title" | "folder")}
              className="px-4 py-3 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm font-medium"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="folder">Sort by Workspace</option>
            </select>

            <button
              onClick={onNewNote}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <PlusIcon />
              Create New
            </button>

            <button
              onClick={onDarkModeToggle}
              className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-300/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 backdrop-blur-sm hover:scale-105"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewModeToggle = ({ viewMode, onViewModeChange }: { 
  viewMode: "grid" | "list"; 
  onViewModeChange: (mode: "grid" | "list") => void 
}) => (
  <div className="flex bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 gap-1 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50">
    <button
      onClick={() => onViewModeChange("grid")}
      className={`p-3 rounded-lg transition-all duration-200 ${
        viewMode === "grid"
          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
          : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
      }`}
      title="Grid View"
    >
      <GridIcon />
    </button>
    <button
      onClick={() => onViewModeChange("list")}
      className={`p-3 rounded-lg transition-all duration-200 ${
        viewMode === "list"
          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
          : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
      }`}
      title="List View"
    >
      <ListIcon />
    </button>
  </div>
);