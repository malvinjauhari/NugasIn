import { useState, useRef, useEffect } from "react";
import { useDocumentStore } from "../../stores";
import { API_BASE } from "../../lib/api";

interface Asset {
  filename: string;
  path: string;
  size: number;
}

export function AssetUploader() {
  const { logoPath, setLogoPath } = useDocumentStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing assets on mount
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch(`${API_BASE}/assets`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch {
      // Server might not be running
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Upload failed");
      }

      const result = await response.json();
      setAssets((prev) => [...prev, result]);
      setLogoPath(result.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelectLogo = (path: string) => {
    setLogoPath(path === logoPath ? null : path);
  };

  const handleRemoveLogo = () => {
    setLogoPath(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Logo / Aset</h3>

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/webp"
          onChange={handleUpload}
          className="hidden"
          id="asset-upload"
        />
        <label
          htmlFor="asset-upload"
          className={`flex items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50 ${
            uploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <span className="text-sm text-muted-foreground">
            {uploading ? "Uploading..." : "+ Klik untuk upload gambar"}
          </span>
        </label>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>

      {/* Current logo */}
      {logoPath && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Logo Terpilih
          </label>
          <div className="relative group">
            <img
              src={`${API_BASE}/assets/${logoPath.split("/").pop()}`}
              alt="Selected logo"
              className="w-full h-32 object-contain border border-border rounded-lg bg-white p-2"
            />
            <button
              onClick={handleRemoveLogo}
              className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Asset list */}
      {assets.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Aset Tersedia
          </label>
          <div className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <button
                key={asset.filename}
                onClick={() => handleSelectLogo(asset.path)}
                className={`relative p-2 border rounded-lg transition-colors ${
                  logoPath === asset.path
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img
                  src={`${API_BASE}/assets/${asset.filename}`}
                  alt={asset.filename}
                  className="w-full h-16 object-contain"
                />
                <p className="text-[10px] text-muted-foreground mt-1 truncate">
                  {asset.filename}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No assets message */}
      {assets.length === 0 && !uploading && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Belum ada aset. Upload gambar untuk digunakan sebagai logo.
        </p>
      )}
    </div>
  );
}
