import { Editor } from "@tiptap/react";

interface EditorToolbarProps {
  editor: Editor | null;
  onSave: (e: React.MouseEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const EditorToolbar = ({
  editor,
  onSave,
  onCancel,
  isEditing,
}: EditorToolbarProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {/* File Operations */}
          <div className="flex items-center gap-1 mr-4">
            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {isEditing ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Cancel
            </button>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
            <select
              className="px-2 py-1 border rounded text-sm bg-white dark:bg-gray-700 dark:text-white"
              onChange={(e) => {
                if (e.target.value === "paragraph") {
                  editor?.chain().focus().setParagraph().run();
                } else {
                  const level = parseInt(e.target.value) as 1 | 2 | 3;
                  editor?.chain().focus().toggleHeading({ level }).run();
                }
              }}
            >
              <option value="paragraph">Normal</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
            </select>

            <div className="flex">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  editor?.isActive("bold")
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
                title="Bold"
              >
                <span className="font-bold">B</span>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  editor?.isActive("italic")
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
                title="Italic"
              >
                <span className="italic">I</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  editor?.chain().focus().toggleUnderline().run()
                }
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  editor?.isActive("underline")
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
                title="Underline"
              >
                <span className="underline">U</span>
              </button>
            </div>

            <div className="flex">
              <button
                type="button"
                onClick={() =>
                  editor?.chain().focus().toggleBulletList().run()
                }
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  editor?.isActive("bulletList")
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
                title="Bullet List"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 5a1 1 0 011-1h1a1 1 0 010 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm12-10a1 1 0 01-1 1H6a1 1 0 010-2h7a1 1 0 011 1zm-1 5a1 1 0 100 2H6a1 1 0 100-2h7zm-1 5a1 1 0 100 2H6a1 1 0 100-2h7z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  editor?.isActive("orderedList")
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
                title="Numbered List"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 5a1 1 0 011-1h1a1 1 0 010 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm0 5a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm12-10a1 1 0 01-1 1H6a1 1 0 010-2h7a1 1 0 011 1zm-1 5a1 1 0 100 2H6a1 1 0 100-2h7zm-1 5a1 1 0 100 2H6a1 1 0 100-2h7z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() =>
                  editor?.chain().focus().toggleTaskList().run()
                }
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  editor?.isActive("taskList")
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
                title="Checklist"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() =>
                  editor?.chain().focus().toggleBlockquote().run()
                }
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  editor?.isActive("blockquote")
                    ? "bg-gray-200 dark:bg-gray-700"
                    : ""
                }`}
                title="Blockquote"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;
