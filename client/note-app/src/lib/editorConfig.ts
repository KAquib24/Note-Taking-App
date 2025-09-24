import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Blockquote from "@tiptap/extension-blockquote";
import Underline from "@tiptap/extension-underline";

export const editorExtensions = [
  StarterKit.configure({
    heading: false,
  }),
  Heading.configure({ levels: [1, 2, 3] }),
  TaskList,
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: 'task-item',
    },
  }),
  Blockquote,
  Underline,
];

export const editorProps = {
  attributes: {
    class: 'prose prose-lg max-w-none dark:prose-invert focus:outline-none min-h-[500px] p-4',
  },
};