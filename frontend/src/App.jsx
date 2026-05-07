import { Editor } from "@monaco-editor/react";
import { useRef, useMemo } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { MonacoBinding } from "y-monaco";
import { useState } from "react";
import { useEffect } from "react";

const App = () => {
  const editorRef = useRef(null);
  const [username, setUserName] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  const [users, setUsers] = useState([]);
  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;

    if(!editor.getModel()){
      console.log("Editor model is not ready");
    }
  };

    const handleJoin = (e) => {
    e.preventDefault();
    setUserName(e.target.username.value);
    window.history.pushState({}, "", "?username=" + e.target.username.value);
    
  };

  useEffect(() => {
    let provider;
    let monacoBinding;
    function handleBeforeUnload() {
      if (provider) provider.awareness.setLocalStateField("user", null);
    }

    if (username && editorRef.current) {
      provider = new SocketIOProvider(
        "/",
        "monaco",
        ydoc,
        {
          autoConnect: true,
        },
      );

      provider.awareness.setLocalStateField("user", { username });

      const states = Array.from(provider.awareness.getStates().values());
      setUsers(states.filter(state => state.user && state.user.username).map(state => state.user));

      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values());
        setUsers(
          states
            .filter((state) => state.user && state.user.username)
            .map((state) => state.user),
        );
      });

      monacoBinding = new MonacoBinding(
        yText,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        provider.awareness,
      );

      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      if (monacoBinding) monacoBinding.destroy();
      if (provider) provider.disconnect();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [username, ydoc, yText]);


  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
        <form className="flex flex-col gap-4" onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Enter your username "
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
            name="username"
          />
          <button className="p-2 rounded-lg bg-amber-500 text-gray-950 font-bold">
            Join
          </button>
        </form>
      </main>
    );
  }
return (
  <main className="h-screen w-full bg-[#0f172a] flex p-3 gap-3">
    
    {/* Sidebar */}
    <aside className="h-full w-1/4 bg-[#111827] rounded-2xl shadow-lg flex flex-col border border-gray-800">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">👥 Users</h2>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
          Live
        </span>
      </div>

      {/* User List */}
      <ul className="flex-1 overflow-y-auto p-3 space-y-2">
        {users.map((user, index) => (
          <li
            key={index}
            className="flex items-center gap-3 p-2 rounded-xl bg-[#1f2937] hover:bg-[#374151] transition"
          >
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {user.username[0]?.toUpperCase()}
            </div>

            {/* Name */}
            <span className="text-gray-200 font-medium">
              {user.username}
            </span>

            {/* Online Dot */}
            <span className="ml-auto h-2 w-2 bg-green-400 rounded-full"></span>
          </li>
        ))}
      </ul>
    </aside>

    {/* Editor Section */}
    <section className="h-full flex-1 bg-[#020617] rounded-2xl border border-gray-800 shadow-lg overflow-hidden flex flex-col">
      
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-gray-800 bg-[#020617]">
        <span className="text-gray-400 text-sm">
          collaborative-editor.js
        </span>

        <span className="text-xs text-gray-500">
          {username}
        </span>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="//Start collaborating🚀"
          theme="vs-dark"
          onMount={handleMount}
        />
      </div>
    </section>
  </main>
);
};

export default App;
