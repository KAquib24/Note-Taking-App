import { Editor } from "@tiptap/react";

interface RibbonHeaderProps {
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  onAiOpen: () => void;
  passwordState: any;
  onPasswordAction: (action: string) => void;
  onPasswordChange: (password: string) => void;
  editor: Editor | null;
}

export const RibbonHeader = ({ 
  onSave, 
  onCancel, 
  onAiOpen, 
  passwordState, 
  onPasswordAction, 
  onPasswordChange,
  editor 
}: RibbonHeaderProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 shadow-sm">
      {/* Quick Access Toolbar */}
      <div className="bg-gray-100 dark:bg-gray-900 px-4 py-1 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      </div>

      {/* Main Ribbon */}
      <div className="px-6 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <FormattingTools editor={editor} />
          <AITools onAiOpen={onAiOpen} />
          <PasswordTools 
            passwordState={passwordState}
            onPasswordAction={onPasswordAction}
            onPasswordChange={onPasswordChange}
          />
        </div>
      </div>
    </div>
  );
};

const FormattingTools = ({ editor }: { editor: Editor | null }) => {
  return (
    <div className="flex items-center gap-3">
      {/* Font Group */}
      <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-4">
        <select
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-sm text-sm bg-white dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          onChange={(e) => {
            if (!editor) return;
            
            if (e.target.value === "paragraph") {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = parseInt(e.target.value) as 1 | 2 | 3;
              editor.chain().focus().setHeading({ level }).run();
            }
          }}
          value={editor?.isActive('heading') ?
            (editor?.isActive('heading', { level: 1 }) ? '1' :
              editor?.isActive('heading', { level: 2 }) ? '2' :
              editor?.isActive('heading', { level: 3 }) ? '3' : 'paragraph') : 'paragraph'}
        >
          <option value="paragraph">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <TextFormatButtons editor={editor} />
      </div>

      {/* Paragraph Group */}
      <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-4">
        <ParagraphButtons editor={editor} />
      </div>
    </div>
  );
};

const TextFormatButtons = ({ editor }: { editor: Editor | null }) => {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-sm p-1">
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={`p-2 rounded-sm hover:bg-white dark:hover:bg-gray-600 transition-colors ${
          editor?.isActive("bold") ? "bg-white dark:bg-gray-600 shadow-sm" : ""
        }`}
        title="Bold"
      >
        <span className={`font-bold text-sm ${editor?.isActive("bold") ? "text-blue-600" : ""}`}>B</span>
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-sm hover:bg-white dark:hover:bg-gray-600 transition-colors ${
          editor?.isActive("italic") ? "bg-white dark:bg-gray-600 shadow-sm" : ""
        }`}
        title="Italic"
      >
        <span className={`italic text-sm ${editor?.isActive("italic") ? "text-blue-600" : ""}`}>I</span>
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded-sm hover:bg-white dark:hover:bg-gray-600 transition-colors ${
          editor?.isActive("underline") ? "bg-white dark:bg-gray-600 shadow-sm" : ""
        }`}
        title="Underline"
      >
        <span className={`underline text-sm ${editor?.isActive("underline") ? "text-blue-600" : ""}`}>U</span>
      </button>
    </div>
  );
};

const ParagraphButtons = ({ editor }: { editor: Editor | null }) => {
  const buttons = [
    { 
      icon: "bulletList", 
      title: "Bullet List", 
      iconSvg: "M9 5l7 7-7 7",
      action: () => editor?.chain().focus().toggleBulletList().run()
    },
    { 
      icon: "orderedList", 
      title: "Numbered List", 
      iconSvg: "M4 6h16M4 12h16M4 18h16",
      action: () => editor?.chain().focus().toggleOrderedList().run()
    },
    { 
      icon: "taskList", 
      title: "Checklist", 
      iconSvg: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      action: () => editor?.chain().focus().toggleTaskList().run()
    },
    { 
      icon: "blockquote", 
      title: "Blockquote", 
      iconSvg: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
      action: () => editor?.chain().focus().toggleBlockquote().run()
    },
  ];

  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-sm p-1">
      {buttons.map(({ icon, title, iconSvg, action }) => (
        <button
          key={icon}
          type="button"
          onClick={action}
          className={`p-2 rounded-sm hover:bg-white dark:hover:bg-gray-600 transition-colors ${
            editor?.isActive(icon) ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600" : ""
          }`}
          title={title}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconSvg} />
          </svg>
        </button>
      ))}
    </div>
  );
};

const AITools = ({ onAiOpen }: { onAiOpen: () => void }) => (
  <button
    type="button"
    onClick={onAiOpen}
    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-sm hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm hover:shadow-md"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
    AI Assistant
  </button>
);

const PasswordTools = ({ passwordState, onPasswordAction, onPasswordChange }: any) => (
  <div className="flex items-center gap-2">
    <input
      type="password"
      placeholder="Note Password"
      value={passwordState.password}
      onChange={(e) => onPasswordChange(e.target.value)}
      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-sm text-sm bg-white dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-32"
    />
    {!passwordState.isPasswordProtected ? (
      <button
        type="button"
        onClick={() => onPasswordAction('protect')}
        disabled={!passwordState.password}
        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 transition-all shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        🔒 Protect
      </button>
    ) : (
      <>
        {!passwordState.isUnlocked ? (
          <button
            type="button"
            onClick={() => onPasswordAction('unlock')}
            disabled={!passwordState.password}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            🔓 Unlock
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onPasswordAction('lock')}
            className="flex items-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded-sm hover:bg-yellow-700 transition-all shadow-sm"
          >
            🔒 Lock
          </button>
        )}
        <button
          type="button"
          onClick={() => onPasswordAction('remove')}
          className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-all shadow-sm"
        >
          Remove
        </button>
      </>
    )}
  </div>
);