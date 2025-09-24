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
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6">
      <div className="space-y-6">
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
    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Folder</label>
    <select
      value={formData.folder}
      onChange={(e) => {
        onFormChange({ 
          folder: e.target.value,
          newFolder: e.target.value === "__new__" ? formData.newFolder : "" 
        });
      }}
      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    >
      <option value="">-- Select Folder --</option>
      {folders.map((f: string) => (
        <option key={f} value={f}>{f}</option>
      ))}
      <option value="__new__">Create New Folder...</option>
    </select>

    {formData.folder === "__new__" && (
      <input
        type="text"
        placeholder="New Folder Name"
        value={formData.newFolder}
        onChange={(e) => onFormChange({ newFolder: e.target.value })}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white mt-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    )}
  </div>
);

const TagsSection = ({ formData, onFormChange }: any) => (
  <div>
    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Tags</label>
    <input
      type="text"
      placeholder="Tags (comma separated)"
      value={formData.tags}
      onChange={(e) => onFormChange({ tags: e.target.value })}
      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    />
  </div>
);

const AttachmentsSection = ({ files, onFilesChange, onRemoveFile }: any) => (
  <div>
    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Attachments</label>
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-sm p-4 text-center">
      <input
        type="file"
        multiple
        onChange={onFilesChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className="text-sm text-gray-600 dark:text-gray-400">Click to add files</span>
      </label>
    </div>
    {files.length > 0 && (
      <div className="mt-3 space-y-2">
        {files.map((file: File, idx: number) => (
          <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border">
            <span className="text-sm truncate">{file.name}</span>
            <button
              onClick={() => onRemoveFile(idx)}
              className="text-red-500 hover:text-red-700"
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
  <div className="grid grid-cols-1 gap-4">
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Due Date</label>
      <input
        type="datetime-local"
        value={formData.dueDate}
        onChange={(e) => onFormChange({ dueDate: e.target.value })}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Reminder (minutes)</label>
      <input
        type="number"
        placeholder="Set reminder"
        value={formData.reminder}
        onChange={(e) => onFormChange({ reminder: e.target.value === "" ? "" : parseInt(e.target.value) })}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        min={0}
      />
    </div>
  </div>
);