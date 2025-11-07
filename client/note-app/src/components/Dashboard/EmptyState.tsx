interface EmptyStateProps {
  selectedFolder: string | null;
  onNewNote: () => void;
}

export const EmptyState = ({ selectedFolder, onNewNote }: EmptyStateProps) => {
  return (
    <div className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">No Masterpieces Found</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
        {selectedFolder ? `No notes in the "${selectedFolder}" workspace` : 'Begin your creative journey with a new masterpiece'}
      </p>
      <button
        onClick={onNewNote}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
      >
        Create First Masterpiece
      </button>
    </div>
  );
};