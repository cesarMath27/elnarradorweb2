"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type NewsItem = {
    id: string;
    title: string;
    category_name: string;
    published_at: string;
    is_featured: boolean;
    is_breaking: boolean;
    view_count: number;
    source: string;
};

export default function NotasListPage() {
    const [posts, setPosts] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "featured" | "breaking">("all");

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const { data } = await supabase
                .from("news")
                .select(
                    "id, title, category_name, published_at, is_featured, is_breaking, view_count, source"
                )
                .order("published_at", { ascending: false })
                .limit(100);
            setPosts(data || []);
            setLoading(false);
        }
        load();
    }, []);

    const toggleFeatured = async (id: string, current: boolean) => {
        const supabase = createClient();
        await supabase.from("news").update({ is_featured: !current }).eq("id", id);
        setPosts(
            posts.map((p) =>
                p.id === id ? { ...p, is_featured: !current } : p
            )
        );
    };

    const toggleBreaking = async (id: string, current: boolean) => {
        const supabase = createClient();
        await supabase.from("news").update({ is_breaking: !current }).eq("id", id);
        setPosts(
            posts.map((p) =>
                p.id === id ? { ...p, is_breaking: !current } : p
            )
        );
    };

    const deletePost = async (id: string) => {
        if (!confirm("¿Seguro que deseas eliminar esta noticia? Esta acción no se puede deshacer.")) return;
        const supabase = createClient();
        await supabase.from("news").delete().eq("id", id);
        setPosts(posts.filter((p) => p.id !== id));
    };

    const filtered = posts.filter((p) => {
        if (filter === "featured") return p.is_featured;
        if (filter === "breaking") return p.is_breaking;
        return true;
    });

    return (
        <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Todas las Notas</h1>
                    <p className="text-gray-500 text-sm mt-1">{posts.length} artículos en total</p>
                </div>
                <Link
                    href="/admin/notas/nueva"
                    className="w-full rounded-lg bg-gray-900 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800 sm:w-auto"
                >
                    + Nueva Nota
                </Link>
            </div>

            {/* Filter tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
                {[
                    { key: "all" as const, label: "Todas", count: posts.length },
                    { key: "featured" as const, label: "⭐ Destacadas", count: posts.filter((p) => p.is_featured).length },
                    { key: "breaking" as const, label: "🔴 Última Hora", count: posts.filter((p) => p.is_breaking).length },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                            filter === tab.key
                                ? "bg-gray-900 text-white"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-gray-400 text-center py-20 text-lg">Cargando notas...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-400 text-lg mb-2">No hay notas con este filtro</p>
                    <Link href="/admin/notas/nueva" className="text-blue-600 text-sm hover:underline">
                        Crear una nueva nota
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-4 py-3 text-gray-500 font-semibold">
                                    Título
                                </th>
                                <th className="text-left px-4 py-3 text-gray-500 font-semibold w-28">
                                    Categoría
                                </th>
                                <th className="text-center px-4 py-3 text-gray-500 font-semibold w-20">
                                    Dest.
                                </th>
                                <th className="text-center px-4 py-3 text-gray-500 font-semibold w-20">
                                    Últ. H
                                </th>
                                <th className="text-center px-4 py-3 text-gray-500 font-semibold w-20">
                                    Fuente
                                </th>
                                <th className="text-center px-4 py-3 text-gray-500 font-semibold w-20">
                                    Vistas
                                </th>
                                <th className="text-right px-4 py-3 text-gray-500 font-semibold w-24">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((post) => (
                                <tr
                                    key={post.id}
                                    className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <p className="text-gray-900 font-medium line-clamp-1">
                                            {post.title}
                                        </p>
                                        <p className="text-gray-400 text-xs mt-0.5">
                                            {new Date(post.published_at).toLocaleDateString(
                                                "es-MX",
                                                {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                }
                                            )}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                                            {post.category_name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                toggleFeatured(post.id, post.is_featured)
                                            }
                                            className={`w-7 h-7 rounded-lg cursor-pointer text-sm transition-colors ${
                                                post.is_featured
                                                    ? "bg-amber-500 text-white shadow-sm"
                                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                            }`}
                                            title={post.is_featured ? "Quitar destacada" : "Marcar como destacada"}
                                        >
                                            ⭐
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                toggleBreaking(post.id, post.is_breaking)
                                            }
                                            className={`w-7 h-7 rounded-lg cursor-pointer text-sm transition-colors ${
                                                post.is_breaking
                                                    ? "bg-red-600 text-white shadow-sm"
                                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                            }`}
                                            title={post.is_breaking ? "Quitar última hora" : "Marcar como última hora"}
                                        >
                                            🔴
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                post.source === "wordpress"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-green-100 text-green-700"
                                            }`}
                                        >
                                            {post.source === "wordpress" ? "WP" : "SB"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-500">
                                        {post.view_count || 0}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => deletePost(post.id)}
                                            className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors cursor-pointer hover:underline"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table></div>
                </div>
            )}
        </div>
    );
}

