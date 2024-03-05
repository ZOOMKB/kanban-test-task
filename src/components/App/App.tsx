import React, { useState } from "react";

import LoadIssues from "../loadIssues/LoadIssues";
import KanbanBoard from "../kanbanBoard/KanbanBoard";

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');

  return (
    <main className="app">
      <LoadIssues setUrl={setUrl} />
      <KanbanBoard url={url} />
    </main>
  );
};

export default App;
