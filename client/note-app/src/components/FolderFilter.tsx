interface FolderFilterProps {
  folders: string[];
  selectedFolder: string | null;
  setSelectedFolder: (folder: string | null) => void;
}

const FolderFilter = ({ folders, selectedFolder, setSelectedFolder }: FolderFilterProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Folders</h2>
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 rounded-full transition-all ${
            selectedFolder === null
              ? "bg-blue-500 text-white shadow-md"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
          }`}
          onClick={() => setSelectedFolder(null)}
        >
          All
        </button>
        {folders.map((folder) => (
          <button
            key={folder}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedFolder === folder
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm"
            }`}
            onClick={() => setSelectedFolder(folder)}
          >
            {folder}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FolderFilter;