"use client";

import { useState } from "react";

export default function MigratePage() {
    const [maxPages, setMaxPages] = useState(5);
    const [dryRun, setDryRun] = useState(true);
    const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
    const [result, setResult] = useState<Record<string, unknown> | null>(null);

    const runMigration = async () => {
        setStatus("running");
        setResult(null);

        try {
            const res = await fetch("/api/migrate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-migration-key": "narrador-migrate-2024",
                },
                body: JSON.stringify({ maxPages, dryRun }),
            });

            const data = await res.json();
            setResult(data);
            setStatus(res.ok ? "done" : "error");
        } catch (err) {
            setResult({ error: err instanceof Error ? err.message : "Error de conexión" });
            setStatus("error");
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Migración WordPress</h1>
                <p className="text-gray-500 mt-1">
                    Importa artículos desde elnarradordemexico.com (WordPress)
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Páginas a importar
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={50}
                            value={maxPages}
                            onChange={(e) => setMaxPages(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        <p className="text-gray-400 text-xs mt-1">~20 artículos por página</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Modo
                        </label>
                        <label className="flex items-center gap-3 mt-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={dryRun}
                                onChange={(e) => setDryRun(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700">Modo prueba</span>
                                <p className="text-xs text-gray-400">No guarda datos reales</p>
                            </div>
                        </label>
                    </div>
                </div>

                <button
                    onClick={runMigration}
                    disabled={status === "running"}
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 shadow-sm ${
                        dryRun
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                >
                    {status === "running"
                        ? "⏳ Migrando..."
                        : dryRun
                        ? "🧪 Ejecutar Prueba"
                        : "🚀 Migrar Ahora"}
                </button>

                {!dryRun && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-amber-800 text-sm font-medium">
                            ⚠️ Esto importará artículos reales a tu base de datos
                        </p>
                    </div>
                )}
            </div>

            {result && (
                <div
                    className={`mt-6 bg-white border rounded-xl p-6 shadow-sm ${
                        status === "error" ? "border-red-200" : "border-green-200"
                    }`}
                >
                    <h3 className={`font-semibold mb-3 ${status === "error" ? "text-red-700" : "text-green-700"}`}>
                        {status === "error" ? "❌ Error" : "✅ Resultado"}
                    </h3>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap overflow-auto max-h-80 font-mono bg-gray-50 rounded-lg p-4">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
