interface EmptyStateProps {
  selectedFolder: string | null;
  onNewNote: () => void;
}

export const EmptyState = ({ selectedFolder, onNewNote }: EmptyStateProps) => {
  return (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <svg className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">No notes found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        {selectedFolder ? `No notes in the "${selectedFolder}" folder` : 'Try changing your search or create a new note'}
      </p>
      <button
        onClick={onNewNote}
        className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors"
      >
        Create Your First Note
      </button>
    </div>
  );
};