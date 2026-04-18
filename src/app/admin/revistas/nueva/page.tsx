"use client";

import { useState, useRef } from "react";
import { uploadMagazine } from "../../actions";

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38";

async function extractPdfFirstPageAsJpeg(file: File): Promise<Blob | null> {
    if (typeof window === "undefined") return null;
    try {
        const g = globalThis as any;
        if (!g.__pdfjsLib) {
            await new Promise<void>((resolve, reject) => {
                const s = document.createElement("script");
                s.type = "module";
                // String content is invisible to webpack — no import() to analyze
                s.textContent =
                    `import*as p from"${PDFJS_CDN}/pdf.min.mjs";` +
                    `p.GlobalWorkerOptions.workerSrc="${PDFJS_CDN}/pdf.worker.min.mjs";` +
                    `globalThis.__pdfjsLib=p;` +
                    `document.dispatchEvent(new CustomEvent("__pdfjs_ready"));`;
                document.addEventListener("__pdfjs_ready", () => resolve(), { once: true });
                s.onerror = () => reject(new Error("pdfjs load failed"));
                document.head.appendChild(s);
            });
        }

        const pdfjsLib = g.__pdfjsLib;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        await page.render({ canvasContext: ctx, viewport }).promise;
        return await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.88);
        });
    } catch {
        return null;
    }
}

export default function NuevaRevistaPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [coverPreview, setCoverPreview] = useState("");
    const [pdfName, setPdfName] = useState("");
    const [coverIsExtracted, setCoverIsExtracted] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverPreview(URL.createObjectURL(file));
            setCoverIsExtracted(false);
        }
    };

    const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPdfName(file.name);

        // Skip extraction if a manual cover is already selected
        if (coverInputRef.current?.files?.length) return;

        setExtracting(true);
        const blob = await extractPdfFirstPageAsJpeg(file);
        setExtracting(false);

        if (blob && coverInputRef.current) {
            const extractedFile = new File([blob], "cover-extracted.jpg", { type: "image/jpeg" });
            const dt = new DataTransfer();
            dt.items.add(extractedFile);
            coverInputRef.current.files = dt.files;
            setCoverPreview(URL.createObjectURL(blob));
            setCoverIsExtracted(true);
        }
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const result = await uploadMagazine(formData);

        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            formRef.current?.reset();
            setCoverPreview("");
            setPdfName("");
            setCoverIsExtracted(false);
        }
        setLoading(false);
    }

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

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Título de la Revista <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
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
                                Edición (mes/año o número) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="edition"
                                required
                                placeholder="Ej: Marzo 2026 o No. 15"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">⭐ Destacar Revista</span>
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
                        name="description"
                        required
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
                            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer bg-gray-50">
                                <input
                                    type="file"
                                    name="pdfFile"
                                    accept="application/pdf"
                                    required
                                    onChange={handlePdfChange}
                                    className="hidden"
                                />
                                {pdfName ? (
                                    <div>
                                        <span className="text-3xl">📄</span>
                                        <p className="text-green-700 font-medium text-sm mt-2">{pdfName}</p>
                                        <p className="text-gray-400 text-xs mt-1">Clic para cambiar</p>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-3xl">📄</span>
                                        <p className="text-gray-600 text-sm font-medium mt-2">Seleccionar PDF</p>
                                        <p className="text-gray-400 text-xs mt-1">Máximo 50 MB</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Cover Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Imagen de portada
                            </label>
                            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer bg-gray-50">
                                <input
                                    type="file"
                                    name="coverImage"
                                    accept="image/*"
                                    ref={coverInputRef}
                                    onChange={handleCoverChange}
                                    className="hidden"
                                />
                                {extracting ? (
                                    <div>
                                        <span className="text-3xl">⏳</span>
                                        <p className="text-gray-500 text-sm mt-2">Extrayendo portada...</p>
                                    </div>
                                ) : coverPreview ? (
                                    <div className="flex flex-col items-center">
                                        <img
                                            src={coverPreview}
                                            alt="Preview"
                                            className="w-20 h-28 object-cover rounded shadow-sm"
                                        />
                                        {coverIsExtracted ? (
                                            <p className="text-blue-600 text-xs mt-1 font-medium">
                                                Extraída automáticamente del PDF
                                            </p>
                                        ) : (
                                            <p className="text-gray-400 text-xs mt-2">Clic para cambiar</p>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-3xl">🖼️</span>
                                        <p className="text-gray-600 text-sm font-medium mt-2">Subir portada</p>
                                        <p className="text-gray-400 text-xs mt-1">JPG, PNG, WebP</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 rounded-xl text-white font-semibold shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: loading ? "#9CA3AF" : "#16A34A",
                        }}
                    >
                        {loading ? "⏳ Subiendo..." : "📖 Publicar Revista"}
                    </button>
                </div>
            </form>
        </div>
    );
}
