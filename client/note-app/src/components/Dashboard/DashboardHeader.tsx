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
    <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-light text-gray-900 dark:text-white">
              Notes Dashboard
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredNotesCount} {filteredNotesCount === 1 ? 'note' : 'notes'}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
            
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "date" | "title" | "folder")}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="folder">Sort by Folder</option>
            </select>

            <button
              onClick={onNewNote}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <PlusIcon />
              New Note
            </button>

            <button
              onClick={onDarkModeToggle}
              className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-sm p-1">
    <button
      onClick={() => onViewModeChange("grid")}
      className={`p-2 rounded-sm transition-colors ${
        viewMode === "grid"
          ? "bg-white dark:bg-gray-600 shadow-sm"
          : "hover:bg-white dark:hover:bg-gray-600"
      }`}
      title="Grid View"
    >
      <GridIcon />
    </button>
    <button
      onClick={() => onViewModeChange("list")}
      className={`p-2 rounded-sm transition-colors ${
        viewMode === "list"
          ? "bg-white dark:bg-gray-600 shadow-sm"
          : "hover:bg-white dark:hover:bg-gray-600"
      }`}
      title="List View"
    >
      <ListIcon />
    </button>
  </div>
);