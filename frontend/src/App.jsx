import { Editor } from "@monaco-editor/react";
import { useRef, useMemo } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { MonacoBinding } from "y-monaco";

const App = () => {
  const editorRef = useRef(null);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,{
        autoConnect: true,
      },
    );
    const monacoBinding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness,
    );
  };
  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-2">
      <aside className="h-full w-2/5 bg-amber-100 rounded-md"></aside>
      <section className="h-full w-3/4 bg-neutral-800">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
};

export default App;
