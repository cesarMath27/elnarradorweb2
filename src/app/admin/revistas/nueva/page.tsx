"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveMagazine } from "../../actions";

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

type UploadState = {
    progress: number;   // 0-100
    status: "idle" | "uploading" | "done" | "error";
    error?: string;
};

/**
 * Obtiene un token firmado del servidor y luego usa el cliente JS de Supabase
 * con uploadToSignedUrl, que internamente usa el protocolo TUS (subida en chunks).
 * TUS no tiene el límite de ~50 MB del PUT estándar y soporta archivos de 200 MB+.
 */
async function uploadFileDirect(
    file: File,
    storagePath: string,
    onProgress: (pct: number) => void
): Promise<string> {
    // 1. Pedir token firmado al servidor (no expone la service-role key al browser)
    const res = await fetch("/api/upload-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: storagePath }),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error ?? "No se pudo obtener la URL firmada.");

    const { token, path } = json as { signedUrl: string; token: string; path: string };

    // 2. Subir usando el cliente de Supabase con TUS (chunks automáticos para archivos grandes)
    onProgress(1); // indicar que empezó
    const supabase = createClient();

    const { error } = await (supabase.storage.from("media") as any).uploadToSignedUrl(
        path,
        token,
        file,
        {
            contentType: file.type || "application/octet-stream",
            onUploadProgress: (progress: { loaded: number; total: number }) => {
                if (progress.total > 0) {
                    onProgress(Math.round((progress.loaded / progress.total) * 100));
                }
            },
        }
    );

    if (error) throw new Error((error as Error).message ?? "Error al subir el archivo.");

    // 3. Devolver la URL pública
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
}

/* ═════════════════════════════════════════════════════════ */

export default function NuevaRevistaPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [title, setTitle] = useState("");
    const [edition, setEdition] = useState("");
    const [description, setDescription] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);

    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState("");
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    const [coverUpload, setCoverUpload] = useState<UploadState>({ progress: 0, status: "idle" });
    const [pdfUpload, setPdfUpload] = useState<UploadState>({ progress: 0, status: "idle" });

    function reset() {
        setTitle("");
        setEdition("");
        setDescription("");
        setIsFeatured(false);
        setCoverFile(null);
        setCoverPreview("");
        setPdfFile(null);
        setCoverUpload({ progress: 0, status: "idle" });
        setPdfUpload({ progress: 0, status: "idle" });
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!pdfFile) { setError("Debes seleccionar un archivo PDF."); return; }
        if (!title.trim()) { setError("El título es obligatorio."); return; }
        if (!edition.trim()) { setError("La edición es obligatoria."); return; }

        setLoading(true);
        setError(null);
        setSuccess(false);

        const slug = generateSlug(title);
        const ts = Date.now();

        let cover_image_url = "";
        let pdf_url = "";

        try {
            // Upload cover image (optional)
            if (coverFile) {
                const ext = coverFile.name.split(".").pop();
                const path = `magazines/${ts}-cover-${slug}.${ext}`;
                setCoverUpload({ progress: 0, status: "uploading" });
                cover_image_url = await uploadFileDirect(coverFile, path, (pct) =>
                    setCoverUpload({ progress: pct, status: "uploading" })
                );
                setCoverUpload({ progress: 100, status: "done" });
            }

            // Upload PDF (required)
            const pdfExt = pdfFile.name.split(".").pop();
            const pdfPath = `magazines/${ts}-pdf-${slug}.${pdfExt}`;
            setPdfUpload({ progress: 0, status: "uploading" });
            pdf_url = await uploadFileDirect(pdfFile, pdfPath, (pct) =>
                setPdfUpload({ progress: pct, status: "uploading" })
            );
            setPdfUpload({ progress: 100, status: "done" });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error al subir archivo.";
            setError(msg);
            setCoverUpload((s) => s.status === "uploading" ? { ...s, status: "error", error: msg } : s);
            setPdfUpload((s) => s.status === "uploading" ? { ...s, status: "error", error: msg } : s);
            setLoading(false);
            return;
        }

        // Save metadata to DB
        const result = await saveMagazine({
            title,
            description,
            edition,
            is_featured: isFeatured,
            cover_image_url,
            pdf_url,
        });

        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            reset();
        }
        setLoading(false);
    }

    const isUploading = pdfUpload.status === "uploading" || coverUpload.status === "uploading";

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Subir Nueva Revista</h1>
                <p className="text-gray-500 mt-1">Publica una nueva edición de tu revista en PDF</p>
            </div>

            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    <div>
                        <p className="text-green-800 font-semibold">¡Revista publicada exitosamente!</p>
                        <p className="text-green-700 text-sm">Ya está disponible para los lectores.</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-red-600 text-xl">❌</span>
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Título de la Revista <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Ej: El Narrador de México - Edición Marzo 2026"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                </div>

                {/* Edition + Featured */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Edición <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={edition}
                                onChange={(e) => setEdition(e.target.value)}
                                required
                                placeholder="Ej: Marzo 2026 o No. 15"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-700">⭐ Destacar Revista</span>
                                    <p className="text-xs text-gray-400">Aparece como revista principal</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Breve descripción de esta edición de la revista..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                    />
                </div>

                {/* Files */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Archivos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* PDF */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Archivo PDF <span className="text-red-500">*</span>
                            </label>
                            <label className={`block border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer bg-gray-50 ${pdfFile ? "border-green-400" : "border-gray-300 hover:border-green-400"}`}>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0] || null;
                                        setPdfFile(f);
                                        setPdfUpload({ progress: 0, status: "idle" });
                                    }}
                                    className="hidden"
                                />
                                {pdfFile ? (
                                    <div>
                                        <span className="text-3xl">📄</span>
                                        <p className="text-green-700 font-medium text-sm mt-2 break-all">{pdfFile.name}</p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            {(pdfFile.size / (1024 * 1024)).toFixed(1)} MB · Clic para cambiar
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-3xl">📄</span>
                                        <p className="text-gray-600 text-sm font-medium mt-2">Seleccionar PDF</p>
                                        <p className="text-gray-400 text-xs mt-1">Sin límite de tamaño</p>
                                    </div>
                                )}
                            </label>
                            <ProgressBar state={pdfUpload} label="PDF" />
                        </div>

                        {/* Cover image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Imagen de portada
                            </label>
                            <label className={`block border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer bg-gray-50 ${coverFile ? "border-green-400" : "border-gray-300 hover:border-green-400"}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0] || null;
                                        setCoverFile(f);
                                        setCoverPreview(f ? URL.createObjectURL(f) : "");
                                        setCoverUpload({ progress: 0, status: "idle" });
                                    }}
                                    className="hidden"
                                />
                                {coverPreview ? (
                                    <div className="flex flex-col items-center">
                                        <img src={coverPreview} alt="Preview" className="w-20 h-28 object-cover rounded shadow-sm" />
                                        <p className="text-gray-400 text-xs mt-2">Clic para cambiar</p>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-3xl">🖼️</span>
                                        <p className="text-gray-600 text-sm font-medium mt-2">Subir portada</p>
                                        <p className="text-gray-400 text-xs mt-1">JPG, PNG, WebP</p>
                                    </div>
                                )}
                            </label>
                            <ProgressBar state={coverUpload} label="Portada" />
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                        <span className="text-blue-500 text-sm mt-0.5">ℹ️</span>
                        <p className="text-blue-700 text-xs leading-relaxed">
                            Los archivos se suben <strong>directo a Supabase Storage desde tu navegador</strong>, por lo que no hay límite de tamaño impuesto por el servidor. Puedes subir PDFs de 200 MB o más.
                        </p>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading || isUploading}
                        className="px-8 py-3.5 rounded-xl text-white font-semibold shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: loading || isUploading ? "#9CA3AF" : "#16A34A" }}
                    >
                        {isUploading
                            ? `⏳ Subiendo archivos...`
                            : loading
                                ? "⏳ Guardando..."
                                : "📖 Publicar Revista"}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ── Progress bar component ── */
function ProgressBar({ state, label }: { state: UploadState; label: string }) {
    if (state.status === "idle") return null;

    const color =
        state.status === "error"
            ? "bg-red-500"
            : state.status === "done"
                ? "bg-green-500"
                : "bg-blue-500";

    return (
        <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">
                    {state.status === "uploading" && `Subiendo ${label}...`}
                    {state.status === "done" && `${label} listo ✓`}
                    {state.status === "error" && `Error en ${label}`}
                </span>
                <span className="text-gray-500 font-medium">{state.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-200 ${color}`}
                    style={{ width: `${state.progress}%` }}
                />
            </div>
            {state.error && <p className="text-xs text-red-600 mt-1">{state.error}</p>}
        </div>
    );
}
