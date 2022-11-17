import Editor, { useMonaco } from "@monaco-editor/react";
import React, { useCallback, useEffect, useState, useRef } from "react";
import solarized from "./solarized.json";

const options = {
  fontSize: "32",
  miniMap: false,
  minimap: {
    enabled: false,
  },
};

function App() {
  const editorRef = useRef(null);
  const [theme, setTheme] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(null);
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("solarized", solarized);
      setTheme("solarized");
    }
  }, [monaco]);

  const setSelection = useCallback(
    (selection) => {
      if (!monaco || !editorRef.current) {
        return;
      }
      editorRef.current.revealLine(selection.start.line + 1);
      editorRef.current.setSelection(new monaco.Selection(selection.start.line + 1, selection.start.character + 1, selection.end.line + 1, selection.end.character + 1));
    },
    [editorRef, monaco]
  );

  const ws = new WebSocket("ws://localhost:5050");

  let setSelectionDebounce = null;
  ws.addEventListener("message", function (event) {
    const data = JSON.parse(event.data);

    if (data.setCode) {
      setCode(data.setCode);
    }

    if (data.setLanguage) {
      setLanguage(data.setLanguage);
    }

    if (data.setSelection) {
      clearTimeout(setSelectionDebounce);
      setSelectionDebounce = setTimeout(() => {
        setSelection(data.setSelection);
      }, 200);
    }
  });

  return <Editor height="100vh" value={code} theme={theme} options={options} language={language} onMount={(editor) => (editorRef.current = editor)} />;
}

export default App;
