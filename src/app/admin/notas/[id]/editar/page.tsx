"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const categories = [
    { slug: "mexico", name: "México" },
    { slug: "economia", name: "Economía" },
    { slug: "cultura", name: "Cultura" },
    { slug: "internacional", name: "Internacional" },
    { slug: "deportes", name: "Deportes" },
    { slug: "estilo", name: "Estilo" },
    { slug: "ciencia", name: "Ciencia" },
    { slug: "opinion", name: "Opinión" },
    { slug: "sociedad", name: "Sociedad" },
    { slug: "tecnologia", name: "Tecnología" },
];

type ToolbarBtn = { cmd: string; arg?: string; icon: string; title: string; group?: string };

const toolbar: ToolbarBtn[] = [
    { cmd: "bold", icon: "B", title: "Negrita", group: "format" },
    { cmd: "italic", icon: "I", title: "Cursiva", group: "format" },
    { cmd: "underline", icon: "U", title: "Subrayado", group: "format" },
    { cmd: "sep", icon: "", title: "", group: "sep1" },
    { cmd: "formatBlock", arg: "h2", icon: "H2", title: "Título", group: "block" },
    { cmd: "formatBlock", arg: "h3", icon: "H3", title: "Subtítulo", group: "block" },
    { cmd: "formatBlock", arg: "blockquote", icon: "❝", title: "Cita", group: "block" },
    { cmd: "sep", icon: "", title: "", group: "sep2" },
    { cmd: "insertUnorderedList", icon: "•", title: "Lista", group: "list" },
    { cmd: "insertOrderedList", icon: "1.", title: "Lista numerada", group: "list" },
    { cmd: "sep", icon: "", title: "", group: "sep3" },
    { cmd: "createLink", icon: "🔗", title: "Insertar enlace", group: "media" },
    { cmd: "formatBlock", arg: "p", icon: "¶", title: "Párrafo normal", group: "block" },
];

export default function EditarNotaPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [title, setTitle] = useState("");
    const [categorySlug, setCategorySlug] = useState("");
    const [author, setAuthor] = useState("");
    const [summary, setSummary] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [isBreaking, setIsBreaking] = useState(false);

    const [imageOption, setImageOption] = useState<"upload" | "url" | "keep">("keep");
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState("");

    const editorRef = useRef<HTMLDivElement>(null);
    const [contentHtml, setContentHtml] = useState("");

    useEffect(() => {
        async function loadArticle() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("news")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                setError("No se encontró la nota.");
                setLoadingData(false);
                return;
            }

            setTitle(data.title || "");
            setCategorySlug(data.category_slug || "");
            setAuthor(data.author_name || "");
            setSummary(data.summary || "");
            setIsFeatured(data.is_featured || false);
            setIsBreaking(data.is_breaking || false);
            setCurrentImageUrl(data.image_url || "");
            setImagePreview(data.image_url || "");
            setContentHtml(data.content || "");

            if (editorRef.current) {
                editorRef.current.innerHTML = data.content || "";
            }

            setLoadingData(false);
        }
        loadArticle();
    }, [id]);

    const syncContent = useCallback(() => {
        if (editorRef.current) setContentHtml(editorRef.current.innerHTML);
    }, []);

    const execCmd = (cmd: string, arg?: string) => {
        if (cmd === "createLink") {
            const url = prompt("URL del enlace:", "https://");
            if (url) document.execCommand("createLink", false, url);
        } else if (cmd === "formatBlock") {
            document.execCommand("formatBlock", false, `<${arg}>`);
        } else {
            document.execCommand(cmd, false, arg);
        }
        editorRef.current?.focus();
        syncContent();
    };

    const categoryName = categories.find((c) => c.slug === categorySlug)?.name || "";
    const wordCount = contentHtml.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;

    async function handleSubmit() {
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.set("id", id);
        formData.set("title", title);
        formData.set("summary", summary);
        formData.set("content", contentHtml);
        formData.set("category_slug", categorySlug);
        formData.set("category_name", categoryName);
        formData.set("author_name", author);
        formData.set("currentImageUrl", currentImageUrl);
        formData.set("imageOption", imageOption === "keep" ? "upload" : imageOption);
        if (isFeatured) formData.set("is_featured", "on");
        if (isBreaking) formData.set("is_breaking", "on");

        if (imageOption === "url") {
            formData.set("imageUrl", imageUrl);
        } else if (imageOption === "upload" && imageFile) {
            formData.set("imageFile", imageFile);
        }

        const result = await fetch(`/api/admin/news/${id}`, {
            method: "PUT",
            body: formData,
        }).then((r) => r.json());

        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            setTimeout(() => router.push("/admin/notas"), 1500);
        }
        setLoading(false);
    }

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-400 text-lg">Cargando nota...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[900px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Editar Nota</h1>
                    <p className="text-gray-500 mt-1 text-sm">Modifica los campos y guarda los cambios</p>
                </div>
                <button
                    onClick={() => router.push("/admin/notas")}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                    ← Volver a notas
                </button>
            </div>

            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    <p className="text-green-800 font-semibold">¡Nota actualizada! Redirigiendo...</p>
                </div>
            )}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-red-600 text-xl">❌</span>
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-5">
                {/* Title */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Título <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{title.length} caracteres</p>
                </div>

                {/* Category + Author */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Categoría <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={categorySlug}
                            onChange={(e) => setCategorySlug(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white"
                        >
                            <option value="">Seleccionar...</option>
                            {categories.map((c) => (
                                <option key={c.slug} value={c.slug}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Autor</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Resumen <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        rows={3}
                        maxLength={300}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{summary.length}/300</p>
                </div>

                {/* Image */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Imagen destacada</label>
                    <div className="flex gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => { setImageOption("keep"); setImagePreview(currentImageUrl); }}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${imageOption === "keep" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-gray-100 text-gray-500 border border-gray-200"}`}
                        >
                            🖼️ Mantener
                        </button>
                        <button
                            type="button"
                            onClick={() => { setImageOption("upload"); setImagePreview(""); }}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${imageOption === "upload" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-gray-100 text-gray-500 border border-gray-200"}`}
                        >
                            📁 Subir nueva
                        </button>
                        <button
                            type="button"
                            onClick={() => { setImageOption("url"); setImagePreview(""); }}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${imageOption === "url" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-gray-100 text-gray-500 border border-gray-200"}`}
                        >
                            🔗 URL
                        </button>
                    </div>
                    <div className="flex gap-3 items-start">
                        <div className="flex-1">
                            {imageOption === "keep" && (
                                <p className="text-sm text-gray-500 py-2">
                                    {currentImageUrl ? "Se conservará la imagen actual." : "No hay imagen actual."}
                                </p>
                            )}
                            {imageOption === "upload" && (
                                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:border-blue-400 cursor-pointer bg-gray-50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                                        }}
                                    />
                                    <p className="text-gray-500 text-sm">Clic para seleccionar imagen</p>
                                    <p className="text-gray-400 text-xs mt-1">JPG, PNG, WebP</p>
                                </label>
                            )}
                            {imageOption === "url" && (
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                        </div>
                        {imagePreview && (
                            <div className="w-28 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview("")} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Rich Text Editor */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50 flex-wrap">
                        {toolbar.map((btn, i) =>
                            btn.cmd === "sep" ? (
                                <div key={btn.group} className="w-px h-6 bg-gray-300 mx-1.5" />
                            ) : (
                                <button
                                    key={i}
                                    type="button"
                                    title={btn.title}
                                    onMouseDown={(e) => { e.preventDefault(); execCmd(btn.cmd, btn.arg); }}
                                    className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                                    style={{ fontStyle: btn.cmd === "italic" ? "italic" : "normal", textDecoration: btn.cmd === "underline" ? "underline" : "none" }}
                                >
                                    {btn.icon}
                                </button>
                            )
                        )}
                        <div className="ml-auto text-xs text-gray-400">{wordCount} palabras</div>
                    </div>
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={syncContent}
                        onBlur={syncContent}
                        className="min-h-[350px] max-h-[600px] overflow-y-auto px-5 py-4 text-gray-800 leading-relaxed focus:outline-none"
                        style={{ fontSize: "1.05rem" }}
                    />
                </div>

                {/* Options */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                            <span className="text-sm font-medium text-gray-700">⭐ Destacada</span>
                            <p className="text-xs text-gray-400">Noticia principal</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isBreaking}
                            onChange={(e) => setIsBreaking(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                        <div>
                            <span className="text-sm font-medium text-gray-700">🔴 Última Hora</span>
                            <p className="text-xs text-gray-400">Noticia urgente</p>
                        </div>
                    </label>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4 pb-8">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !title || !categorySlug || !summary}
                        className="px-8 py-3.5 rounded-xl text-white font-semibold shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        style={{ background: loading ? "#9CA3AF" : "#1C1917" }}
                    >
                        {loading ? "⏳ Guardando..." : "💾 Guardar Cambios"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/admin/notas")}
                        className="px-6 py-3.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium transition-colors cursor-pointer border border-gray-200"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
