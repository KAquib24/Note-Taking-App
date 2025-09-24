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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Folders</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {folders.length} folders
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 rounded-sm border transition-all ${
            selectedFolder === null
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
          onClick={() => onFolderSelect(null)}
        >
          All Notes
        </button>
        {folders.map((folder) => (
          <button
            key={folder}
            className={`px-4 py-2 rounded-sm border transition-all ${
              selectedFolder === folder
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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