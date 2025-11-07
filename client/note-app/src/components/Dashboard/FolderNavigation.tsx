interface FolderNavigationProps {
  folders: string[];
  selectedFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
}

export const FolderNavigation = ({
  folders,
  selectedFolder,
  onFolderSelect,
}: FolderNavigationProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Workspaces</h2>
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-lg border border-white/20 dark:border-gray-700/30">
          {folders.length} workspaces
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className={`px-6 py-3 rounded-xl border transition-all duration-300 font-semibold ${
            selectedFolder === null
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg"
              : "bg-white/80 dark:bg-gray-800/80 border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm hover:scale-105"
          }`}
          onClick={() => onFolderSelect(null)}
        >
          All Masterpieces
        </button>
        {folders.map((folder) => (
          <button
            key={folder}
            className={`px-6 py-3 rounded-xl border transition-all duration-300 font-semibold ${
              selectedFolder === folder
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg"
                : "bg-white/80 dark:bg-gray-800/80 border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm hover:scale-105"
            }`}
            onClick={() => onFolderSelect(folder)}
          >
            {folder}
          </button>
        ))}
      </div>
    </div>
  );
};