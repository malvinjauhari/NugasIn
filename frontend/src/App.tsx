function App() {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-80 border-r border-border bg-muted/30 p-4">
        <h1 className="mb-4 text-lg font-semibold">TugasIn</h1>
        <p className="text-sm text-muted-foreground">
          Configuration panel coming in Phase 5.
        </p>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-[210mm] min-h-[297mm] bg-white shadow-lg border border-border p-[30mm]">
          <p className="text-sm text-muted-foreground text-center">
            Document preview coming in Phase 6.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
