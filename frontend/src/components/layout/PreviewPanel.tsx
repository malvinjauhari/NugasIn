import { useDocumentStore } from "../../stores";

export function PreviewPanel() {
  const { metadata, templateName } = useDocumentStore();

  return (
    <main className="flex-1 overflow-auto bg-muted/20 p-8">
      <div className="mx-auto max-w-[210mm]">
        {/* Document preview */}
        <div
          className="bg-white shadow-lg border border-border"
          style={{
            minHeight: "297mm",
            padding: "30mm 40mm",
          }}
        >
          {!templateName ? (
            <div className="flex items-center justify-center h-[237mm] text-muted-foreground text-sm">
              Pilih template untuk memulai
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cover page preview */}
              <div className="text-center space-y-8 pt-[60mm]">
                <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs">
                  Logo
                </div>
                <div>
                  <h1 className="text-lg font-bold uppercase">
                    {metadata.module || "Judul Praktikum"}
                  </h1>
                </div>
                <div className="text-sm space-y-1">
                  <p>{metadata.author || "Nama Mahasiswa"}</p>
                  <p>{metadata.nim || "NIM"}</p>
                  <p>{metadata.class_name || "Kelas"}</p>
                </div>
                <div className="text-sm text-muted-foreground pt-8">
                  <p>{metadata.program || "Program Studi"}</p>
                  <p>{metadata.faculty || "Fakultas"}</p>
                  <p>{metadata.institution || "Telkom University"}</p>
                  <p>{metadata.year || new Date().getFullYear()}</p>
                </div>
              </div>

              {/* Content preview placeholder */}
              <div className="border-t border-border pt-8 mt-16">
                <p className="text-sm text-muted-foreground text-center">
                  Preview konten dokumen akan ditampilkan di sini
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
