import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type Props = {
  value: string;
  onChange: (content: string) => void;
};

const RichTextEditor = ({ value, onChange }: Props) => {
  const [editorValue, setEditorValue] = useState<string>(value ?? "");
  const quillRef = useRef<ReactQuill | null>(null);

  // Keep editor in sync if parent updates `value`
  useEffect(() => {
    setEditorValue(value ?? "");
  }, [value]);

  // Memoize modules to prevent toolbar re-creation
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
    }),
    []
  );

  return (
    <div className="relative">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={modules}
        placeholder="Write a detailed product description here..."
        className="bg-transparent border border-gray-700 text-white rounded-md"
      />

      {/* Consider moving this to a CSS file */}
      <style>{`
        .ql-toolbar { background: transparent; border-color: #444; }
        .ql-container { background: transparent !important; border-color: #444; color: white; }
        .ql-picker { color: white !important; }
        .ql-editor { min-height: 250px; }
        .ql-snow { border-color: #444 !important; }
        .ql-editor.ql-blank::before { color: #aaa !important; }
        .ql-picker-options { background: #333 !important; color: white !important; }
        .ql-picker-item { color: white !important; }
        .ql-stroke { stroke: white !important; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
