import type { NoteFormData } from "../../types/note";

interface SidePanelProps {
  formData: NoteFormData;
  folders: string[];
  passwordState: any;
  onFormChange: (updates: Partial<NoteFormData>) => void;
  onPasswordChange: (password: string) => void;
  onPasswordAction: (action: string) => void;
  onFilesChange: (files: File[]) => void;
}

export const SidePanel = ({ 
  formData, 
  folders, 
  onFormChange, 
  onFilesChange 
}: SidePanelProps) => {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesChange(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(formData.files.filter((_, i) => i !== index));
  };

  return (
    <div className="w-96 bg-gradient-to-b from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-r border-white/20 dark:border-gray-700/50 p-8">
      <div className="space-y-8">
        <FolderSection 
          formData={formData} 
          folders={folders} 
          onFormChange={onFormChange} 
        />
        
        <TagsSection 
          formData={formData} 
          onFormChange={onFormChange} 
        />
        
        <AttachmentsSection 
          files={formData.files}
          onFilesChange={handleFileInputChange}
          onRemoveFile={removeFile}
        />
        
        <DateTimeSection 
          formData={formData}
          onFormChange={onFormChange}
        />
      </div>
    </div>
  );
};

const FolderSection = ({ formData, folders, onFormChange }: any) => (
  <div>
    <label className="block text-sm font-bold mb-4 text-gray-700 dark:text-gray-300 uppercase tracking-wide">Workspace</label>
    <select
      value={formData.folder}
      onChange={(e) => {
        onFormChange({ 
          folder: e.target.value,
          newFolder: e.target.value === "__new__" ? formData.newFolder : "" 
        });
      }}
      className="w-full p-4 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm font-medium"
    >
      <option value="">Select Workspace</option>
      {folders.map((f: string) => (
        <option key={f} value={f}>{f}</option>
      ))}
      <option value="__new__">Create New Workspace</option>
    </select>

    {formData.folder === "__new__" && (
      <input
        type="text"
        placeholder="New Workspace Name"
        value={formData.newFolder}
        onChange={(e) => onFormChange({ newFolder: e.target.value })}
        className="w-full p-4 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white mt-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm font-medium"
      />
    )}
  </div>
);

const TagsSection = ({ formData, onFormChange }: any) => (
  <div>
    <label className="block text-sm font-bold mb-4 text-gray-700 dark:text-gray-300 uppercase tracking-wide">Labels</label>
    <input
      type="text"
      placeholder="Add labels (comma separated)"
      value={formData.tags}
      onChange={(e) => onFormChange({ tags: e.target.value })}
      className="w-full p-4 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm font-medium"
    />
  </div>
);

const AttachmentsSection = ({ files, onFilesChange, onRemoveFile }: any) => (
  <div>
    <label className="block text-sm font-bold mb-4 text-gray-700 dark:text-gray-300 uppercase tracking-wide">Attachments</label>
    <div className="border-2 border-dashed border-gray-300/50 dark:border-gray-600/50 rounded-xl p-6 text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
      <input
        type="file"
        multiple
        onChange={onFilesChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Drop files or click to upload</span>
      </label>
    </div>
    {files.length > 0 && (
      <div className="mt-4 space-y-2">
        {files.map((file: File, idx: number) => (
          <div key={idx} className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-300/50 dark:border-gray-600/50 backdrop-blur-sm">
            <span className="text-sm font-medium truncate text-gray-700 dark:text-gray-300">{file.name}</span>
            <button
              onClick={() => onRemoveFile(idx)}
              className="w-6 h-6 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all duration-200 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const DateTimeSection = ({ formData, onFormChange }: any) => (
  <div className="grid grid-cols-1 gap-6">
    <div>
      <label className="block text-sm font-bold mb-4 text-gray-700 dark:text-gray-300 uppercase tracking-wide">Due Date</label>
      <input
        type="datetime-local"
        value={formData.dueDate}
        onChange={(e) => onFormChange({ dueDate: e.target.value })}
        className="w-full p-4 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm font-medium"
      />
    </div>
    <div>
      <label className="block text-sm font-bold mb-4 text-gray-700 dark:text-gray-300 uppercase tracking-wide">Reminder</label>
      <input
        type="number"
        placeholder="Set reminder in minutes"
        value={formData.reminder}
        onChange={(e) => onFormChange({ reminder: e.target.value === "" ? "" : parseInt(e.target.value) })}
        className="w-full p-4 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm font-medium"
        min={0}
      />
    </div>
  </div>
);