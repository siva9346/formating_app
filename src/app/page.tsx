"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please select a .txt file");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".txt") || file.type && file.type !== "text/plain") {
      setError("Only .txt files are allowed");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/process", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Upload failed (${res.status})`);
      }
      router.push("/menu");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/15 p-6">
        <h1 className="text-2xl font-semibold mb-2">HomeChef Menu Extractor</h1>
        <p className="text-sm mb-6 opacity-80">Upload a .txt file (e.g., WhatsApp export). We’ll extract menu items using Gemini.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-foreground file:text-background hover:file:opacity-90"
            />
          </div>
          {error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-foreground text-background font-medium disabled:opacity-50"
          >
            {loading ? "Processing…" : "Process File"}
          </button>
        </form>
      </div>
    </div>
  );
}
