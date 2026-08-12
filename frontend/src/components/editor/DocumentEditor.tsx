/**
 * Lexical rich text editor for document editing.
 *
 * Note: The editor is for manual editing only.
 * The Document Model remains the single source of truth.
 * Changes here should sync back to the document model.
 */

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";

import { theme } from "./theme";

function Placeholder() {
  return (
    <div className="editor-placeholder">
      Mulai menulis dokumen...
    </div>
  );
}

const initialConfig = {
  namespace: "TugasInEditor",
  theme,
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
  onError: (error: Error) => {
    console.error("Lexical error:", error);
  },
};

export interface DocumentEditorProps {
  initialContent?: string;
  onChange?: (editorState: string) => void;
  readOnly?: boolean;
}

export function DocumentEditor(_props: DocumentEditorProps) {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container border border-border rounded-lg bg-white">
        <ToolbarPlugin />
        <div className="editor-inner min-h-[400px] p-4">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input outline-none" />}
            placeholder={<Placeholder />}
          />
          <HistoryPlugin />
          <ListPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}

/**
 * Simple toolbar for the editor.
 */
function ToolbarPlugin() {
  return (
    <div className="editor-toolbar flex items-center gap-1 p-2 border-b border-border bg-muted/30">
      <ToolbarButton command="bold" label="B" bold />
      <ToolbarButton command="italic" label="I" italic />
      <ToolbarButton command="underline" label="U" underline />
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarHeadingButton level={1} label="H1" />
      <ToolbarHeadingButton level={2} label="H2" />
      <ToolbarHeadingButton level={3} label="H3" />
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarListButton ordered={false} label="• List" />
      <ToolbarListButton ordered={true} label="1. List" />
    </div>
  );
}

function ToolbarButton({ command, label, bold, italic, underline }: {
  command: string;
  label: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}) {
  const handleClick = () => {
    // TODO: Dispatch Lexical command
    console.log(`Toolbar command: ${command}`);
  };

  return (
    <button
      onClick={handleClick}
      className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors"
      style={{
        fontWeight: bold ? "bold" : undefined,
        fontStyle: italic ? "italic" : undefined,
        textDecoration: underline ? "underline" : undefined,
      }}
      title={command}
    >
      {label}
    </button>
  );
}

function ToolbarHeadingButton({ level, label }: { level: 1 | 2 | 3; label: string }) {
  const handleClick = () => {
    console.log(`Heading level: ${level}`);
  };

  return (
    <button
      onClick={handleClick}
      className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors font-semibold"
      title={`Heading ${level}`}
    >
      {label}
    </button>
  );
}

function ToolbarListButton({ ordered, label }: { ordered: boolean; label: string }) {
  const handleClick = () => {
    console.log(`List ordered: ${ordered}`);
  };

  return (
    <button
      onClick={handleClick}
      className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors"
      title={ordered ? "Ordered list" : "Unordered list"}
    >
      {label}
    </button>
  );
}
