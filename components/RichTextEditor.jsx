"use client";

import { useState } from "react";

export function RichTextEditor({
  value = "",
  onChange,
  height = 500,
  inputName = null,
}) {
  const [htmlMode, setHtmlMode] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue) => {
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
    // Update hidden input if name is provided
    if (inputName) {
      const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
      if (hiddenInput) {
        hiddenInput.value = newValue;
      }
    }
  };

  const formatText = (prefix, suffix = "") => {
    const textarea = document.querySelector(".rich-text-editor textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localValue.substring(start, end);
    const newValue =
      localValue.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      localValue.substring(end);
    handleChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const insertAtCursor = (text) => {
    const textarea = document.querySelector(".rich-text-editor textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue =
      localValue.substring(0, start) + text + localValue.substring(end);
    handleChange(newValue);

    // Move cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  return (
    <div className="rich-text-editor border border-gray-300 rounded-md">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-100 border-b border-gray-300">
        {/* Text formatting */}
        <button
          type="button"
          onClick={() => formatText("**", "**")}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Bold"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          onClick={() => formatText("*", "*")}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Italic"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          onClick={() => formatText("`", "`")}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Code"
        >
          &lt;/&gt;
        </button>

        {/* Headings */}
        <button
          type="button"
          onClick={() => insertAtCursor("\n# ")}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Heading 1"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() => insertAtCursor("\n## ")}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => insertAtCursor("\n### ")}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Heading 3"
        >
          H3
        </button>

        {/* Lists */}
        <button
          type="button"
          onClick={() => insertAtCursor("\n- ")}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Bullet List"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => insertAtCursor("\n1. ")}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Numbered List"
        >
          1. List
        </button>

        {/* Links and Images */}
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL:");
            const text = prompt("Enter link text:", "link");
            if (url && text) {
              insertAtCursor(`[${text}](${url})`);
            }
          }}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Insert Link"
        >
          🔗
        </button>

        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter image URL:");
            const alt = prompt("Enter alt text:", "image");
            if (url) {
              insertAtCursor(`![${alt}](${url})`);
            }
          }}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Insert Image"
        >
          🖼️
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => insertAtCursor("\n> ")}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          title="Blockquote"
        >
          ❝
        </button>

        {/* Toggle HTML mode */}
        <button
          type="button"
          onClick={() => setHtmlMode(!htmlMode)}
          className={`px-3 py-1 text-sm border rounded ${
            htmlMode
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border-gray-300"
          }`}
          title="Toggle HTML Mode"
        >
          HTML
        </button>
      </div>

      {/* Editor */}
      {htmlMode ? (
        <textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          style={{ height: `${height - 50}px` }}
          className="w-full p-4 font-mono text-sm border-0 focus:ring-0 resize-none"
          placeholder="Write your HTML content here..."
        />
      ) : (
        <textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          style={{ height: `${height - 50}px` }}
          className="w-full p-4 border-0 focus:ring-0 resize-none"
          placeholder="Start writing your blog post... Use the toolbar above for formatting."
        />
      )}

      {/* Markdown Help */}
      <div className="p-2 bg-gray-50 border-t border-gray-300 text-xs text-gray-600">
        <div className="flex flex-wrap gap-4">
          <span>
            <strong>**Bold**</strong>
          </span>
          <span>
            <em>*Italic*</em>
          </span>
          <span>
            <code>`Code`</code>
          </span>
          <span># Heading</span>
          <span>- List</span>
          <span>[Link](url)</span>
          <span>![Image](url)</span>
        </div>
      </div>
    </div>
  );
}
