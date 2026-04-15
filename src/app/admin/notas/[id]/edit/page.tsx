"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { updateNews } from "../../../actions";
import { createClient } from "@/lib/supabase/client";

/* ───── categories ───── */
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

/* ───── SEO checks ───── */
type SeoCheck = { label: string; pass: boolean; tip: string; weight: number };

function computeSeo(data: {
    title: string;
    summary: string;
    contentHtml: string;
    hasImage: boolean;
    category: string;
}): { score: number; checks: SeoCheck[] } {
    const wordCount = data.contentHtml.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
    const titleLen = data.title.length;
    const summaryLen = data.summary.length;

    const checks: SeoCheck[] = [
        {
            label: "Título entre 40-70 caracteres",
            pass: titleLen >= 40 && titleLen <= 70,
            tip: titleLen < 40 ? `Muy corto (${titleLen}). Añade más detalle.` : titleLen > 70 ? `Muy largo (${titleLen}). Google puede cortar.` : `Perfecto (${titleLen}).`,
            weight: 20,
        },
        {
            label: "Resumen entre 120-160 caracteres",
            pass: summaryLen >= 120 && summaryLen <= 160,
            tip: summaryLen < 120 ? `Muy corto (${summaryLen}). Amplia la descripción.` : summaryLen > 160 ? `Muy largo (${summaryLen}). Google puede cortar.` : `Perfecto (${summaryLen}).`,
            weight: 20,
        },
        {
            label: "Contenido +300 palabras",
            pass: wordCount >= 300,
            tip: wordCount < 300 ? `Solo ${wordCount} palabras. Google prefiere +300.` : `Excelente (${wordCount} palabras).`,
            weight: 25,
        },
        {
            label: "Imagen destacada presente",
            pass: data.hasImage,
            tip: data.hasImage ? "Imagen configurada." : "Agrega una imagen para redes y SEO.",
            weight: 20,
        },
        {
            label: "Categoría seleccionada",
            pass: data.category !== "",
            tip: data.category ? "Categoría asignada." : "Selecciona una categoría.",
            weight: 15,
        },
    ];

    const earned = checks.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);
    return { score: earned, checks };
}

function seoColor(score: number) {
    if (score >= 80) return "#16A34A";
    if (score >= 50) return "#D97706";
    return "#DC2626";
}

function seoLabel(score: number) {
    if (score >= 80) return "Excelente";
    if (score >= 50) return "Aceptable";
    return "Necesita mejoras";
}

/* ───── Toolbar buttons ───── */
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

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function EditNotaPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    /* form state */
    const [title, setTitle] = useState("");
    const [categorySlug, setCategorySlug] = useState("");
    const [author, setAuthor] = useState("El Narrador");
    const [summary, setSummary] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [isBreaking, setIsBreaking] = useState(false);

    /* image */
    const [imageOption, setImageOption] = useState<"upload" | "url" | "keep">("keep");
    const [imagePreview, setImagePreview] = useState("");
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState("");

    /* rich editor */
    const editorRef = useRef<HTMLDivElement>(null);
    const [contentHtml, setContentHtml] = useState("");

    /* tabs */
    const [tab, setTab] = useState<"editor" | "preview">("editor");

    /* load existing note */
    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("news")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                setError("No se pudo cargar la nota.");
                setLoadingData(false);
                return;
            }

            setTitle(data.title || "");
            setCategorySlug(data.category_slug || "");
            setAuthor(data.author_name || "El Narrador");
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
        load();
    }, [id]);

    /* set editor content once loaded */
    useEffect(() => {
        if (!loadingData && editorRef.current && contentHtml) {
            if (!editorRef.current.innerHTML) {
                editorRef.current.innerHTML = contentHtml;
            }
        }
    }, [loadingData, contentHtml]);

    /* sync content from contentEditable */
    const syncContent = useCallback(() => {
        if (editorRef.current) {
            setContentHtml(editorRef.current.innerHTML);
        }
    }, []);

    /* exec toolbar command */
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

    /* SEO */
    const seo = computeSeo({
        title,
        summary,
        contentHtml,
        hasImage: !!(imagePreview || imageFile),
        category: categorySlug,
    });

    const categoryName = categories.find((c) => c.slug === categorySlug)?.name || "";
    const plainContent = contentHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const wordCount = plainContent ? plainContent.split(/\s+/).length : 0;

    /* submit */
    async function handleSubmit() {
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.set("title", title);
        formData.set("summary", summary);
        formData.set("content", contentHtml);
        formData.set("category_slug", categorySlug);
        formData.set("category_name", categoryName);
        formData.set("author_name", author);
        formData.set("currentImageUrl", currentImageUrl);
        if (isFeatured) formData.set("is_featured", "on");
        if (isBreaking) formData.set("is_breaking", "on");

        if (imageOption === "url") {
            formData.set("imageOption", "url");
            formData.set("imageUrl", imageUrl);
        } else if (imageOption === "upload" && imageFile) {
            formData.set("imageOption", "upload");
            formData.set("imageFile", imageFile);
        } else {
            formData.set("imageOption", "keep");
        }

        const result = await updateNews(id, formData);

        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        setLoading(false);
    }

    if (loadingData) {
        return (
            <div className="flex items-center justify-center py-32">
                <p className="text-gray-400 text-lg">Cargando nota...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link href="/admin/notas" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
                            ← Todas las notas
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Editar Nota</h1>
                    <p className="text-gray-500 mt-1 text-sm">Modifica el contenido y guarda los cambios</p>
                </div>
                {/* Tab switcher */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setTab("editor")}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${tab === "editor" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        ✏️ Editor
                    </button>
                    <button
                        onClick={() => { syncContent(); setTab("preview"); }}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${tab === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        👁️ Vista Previa
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-green-600 text-xl">✅</span>
                    <div>
                        <p className="text-green-800 font-semibold">¡Nota actualizada exitosamente!</p>
                        <p className="text-green-700 text-sm">Los cambios ya están publicados en el sitio.</p>
                    </div>
                </div>
            )}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-red-600 text-xl">❌</span>
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            {/* ═══════ EDITOR TAB ═══════ */}
            <div style={{ display: tab === "editor" ? "block" : "none" }}>
                <div className="flex gap-6">
                    {/* LEFT — form */}
                    <div className="flex-1 min-w-0 space-y-5">
                        {/* Title */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Título <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Escribe un título llamativo para tu nota..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <p className="text-xs text-gray-400 mt-1 text-right">{title.length} caracteres</p>
                        </div>

                        {/* Category + Author */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoría <span className="text-red-500">*</span></label>
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
                                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Resumen <span className="text-red-500">*</span></label>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={3}
                                maxLength={300}
                                placeholder="Breve resumen (aparece en tarjetas y redes sociales)..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-1 text-right">{summary.length}/300</p>
                        </div>

                        {/* Image */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Imagen destacada</label>
                            <div className="flex gap-2 mb-3">
                                <button type="button" onClick={() => { setImageOption("keep"); setImagePreview(currentImageUrl); }} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${imageOption === "keep" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>🔄 Mantener actual</button>
                                <button type="button" onClick={() => setImageOption("upload")} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${imageOption === "upload" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>📁 Subir nueva</button>
                                <button type="button" onClick={() => setImageOption("url")} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${imageOption === "url" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>🔗 URL</button>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="flex-1">
                                    {imageOption === "keep" && (
                                        <p className="text-sm text-gray-500 py-3">
                                            {currentImageUrl ? "Se mantendrá la imagen actual." : "No hay imagen actual."}
                                        </p>
                                    )}
                                    {imageOption === "upload" && (
                                        <label className="block border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:border-blue-400 cursor-pointer bg-gray-50 transition-colors">
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
                                            <p className="text-gray-500 text-sm">Clic para seleccionar imagen</p>
                                            <p className="text-gray-400 text-xs mt-1">JPG, PNG, WebP</p>
                                        </label>
                                    )}
                                    {imageOption === "url" && (
                                        <input type="url" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value); }} placeholder="https://..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                    )}
                                </div>
                                {imagePreview && (
                                    <div className="w-28 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview("")} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ─── Rich Text Editor ─── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Toolbar */}
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
                            {/* Editable area */}
                            <div
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                onInput={syncContent}
                                onBlur={syncContent}
                                data-placeholder="Escribe el contenido de tu artículo aquí..."
                                className="min-h-[350px] max-h-[600px] overflow-y-auto px-5 py-4 text-gray-800 leading-relaxed focus:outline-none"
                                style={{ fontSize: "1.05rem" }}
                            />
                        </div>

                        {/* Options */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-8">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer" />
                                <div>
                                    <span className="text-sm font-medium text-gray-700">⭐ Destacada</span>
                                    <p className="text-xs text-gray-400">Noticia principal</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
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
                                onClick={() => { syncContent(); setTab("preview"); }}
                                className="px-6 py-3.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium transition-colors cursor-pointer border border-gray-200"
                            >
                                👁️ Previsualizar
                            </button>
                            <Link
                                href="/admin/notas"
                                className="px-6 py-3.5 rounded-xl text-gray-500 hover:text-gray-700 font-medium transition-colors cursor-pointer"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT — SEO Meter */}
                    <div className="w-72 shrink-0 space-y-5">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 sticky top-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">📊 Puntuación SEO</h3>
                            <div className="flex justify-center mb-4">
                                <div className="relative w-28 h-28">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                                        <circle
                                            cx="50" cy="50" r="42" fill="none"
                                            stroke={seoColor(seo.score)}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(seo.score / 100) * 264} 264`}
                                            className="transition-all duration-500"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold" style={{ color: seoColor(seo.score) }}>
                                            {seo.score}
                                        </span>
                                        <span className="text-xs text-gray-400">/100</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-sm font-semibold mb-5" style={{ color: seoColor(seo.score) }}>
                                {seoLabel(seo.score)}
                            </p>
                            <div className="space-y-3">
                                {seo.checks.map((c) => (
                                    <div key={c.label} className="flex gap-2">
                                        <span className="text-sm shrink-0 mt-0.5">{c.pass ? "✅" : "⚠️"}</span>
                                        <div>
                                            <p className={`text-sm font-medium ${c.pass ? "text-gray-700" : "text-amber-700"}`}>{c.label}</p>
                                            <p className="text-xs text-gray-400">{c.tip}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-amber-800 mb-2">✏️ Editando nota</h4>
                            <p className="text-xs text-amber-700">Los cambios se aplicarán al artículo publicado inmediatamente al guardar.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ PREVIEW TAB ═══════ */}
            <div style={{ display: tab === "preview" ? "block" : "none" }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-red-400" />
                                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                                <span className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <span className="text-xs text-gray-400 font-mono">elnarradordemexico.com/articulo/{id}</span>
                        </div>
                        <button
                            onClick={() => setTab("editor")}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                            ← Volver al editor
                        </button>
                    </div>

                    <div style={{ background: "#F5F5F0", minHeight: "600px" }}>
                        <div className="max-w-3xl mx-auto px-6 py-10">
                            <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "#78716C" }}>
                                <span style={{ color: "#B8920F" }}>Inicio</span>
                                <span>/</span>
                                {categoryName && (
                                    <>
                                        <span style={{ color: "#B8920F" }}>{categoryName}</span>
                                        <span>/</span>
                                    </>
                                )}
                                <span className="line-clamp-1" style={{ color: "#A8A29E" }}>{title || "Sin título"}</span>
                            </nav>

                            {categoryName && (
                                <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm mb-3" style={{ background: "#D4A517", color: "white" }}>
                                    {categoryName}
                                </span>
                            )}

                            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4" style={{ fontFamily: "'Georgia', serif", color: "#0C0A09" }}>
                                {title || "Título de tu artículo"}
                            </h1>

                            {summary && (
                                <p className="text-lg leading-relaxed mb-4" style={{ color: "#78716C" }}>{summary}</p>
                            )}

                            <div className="flex items-center gap-4 text-sm mb-8 pb-6 border-b" style={{ color: "#A8A29E", borderColor: "#E7E5E4" }}>
                                <span className="font-medium" style={{ color: "#0C0A09" }}>{author || "El Narrador"}</span>
                                <time>{new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</time>
                            </div>

                            {imagePreview && (
                                <div className="rounded-lg overflow-hidden mb-8" style={{ aspectRatio: "16/9", background: "#E7E5E4" }}>
                                    <img src={imagePreview} alt="Featured" className="w-full h-full object-cover" />
                                </div>
                            )}

                            {contentHtml ? (
                                <div className="article-content leading-relaxed text-lg" style={{ color: "#0C0A09" }} dangerouslySetInnerHTML={{ __html: contentHtml }} />
                            ) : (
                                <div className="text-center py-16" style={{ color: "#A8A29E" }}>
                                    <p className="text-lg">El contenido de tu artículo aparecerá aquí</p>
                                </div>
                            )}

                            <div className="mt-10 pt-6 border-t flex items-center gap-3" style={{ borderColor: "#E7E5E4" }}>
                                <span className="text-sm font-medium" style={{ color: "#78716C" }}>Compartir:</span>
                                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1877F2" }}>Facebook</span>
                                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#000" }}>X</span>
                                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#25D366" }}>WhatsApp</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border-t border-gray-200 px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm">📊 SEO:</span>
                                <span className="text-sm font-bold" style={{ color: seoColor(seo.score) }}>{seo.score}/100</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-500">{wordCount} palabras</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setTab("editor")}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                                ✏️ Editar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !title || !categorySlug || !summary}
                                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                style={{ background: loading ? "#9CA3AF" : "#1C1917" }}
                            >
                                {loading ? "⏳ Guardando..." : "💾 Guardar Cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
