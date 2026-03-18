"use client";

import { useState } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elnarradordemexico.com";

type Props = {
    articleId: string;
    status: "published" | "scheduled";
    scheduledAt?: string;
    onClose: () => void;
};

export default function PublishSuccessModal({ articleId, status, scheduledAt, onClose }: Props) {
    const [copied, setCopied] = useState(false);
    const articleUrl = `${SITE_URL}/articulo/${articleId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(articleUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const input = document.createElement("input");
            input.value = articleUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formattedDate = scheduledAt
        ? new Date(scheduledAt).toLocaleString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
                {status === "published" ? (
                    <>
                        <div className="text-center mb-4">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">✅</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Nota publicada</h2>
                            <p className="text-gray-500 text-sm mt-1">Tu artículo ya está visible en el sitio</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-4">
                            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">🕐</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Nota programada</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Se publicará el {formattedDate}
                            </p>
                        </div>
                    </>
                )}

                <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Link de la nota
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={articleUrl}
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none"
                        />
                        <button
                            onClick={handleCopy}
                            className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shrink-0"
                            style={{
                                background: copied ? "#16A34A" : "#1C1917",
                                color: "white",
                            }}
                        >
                            {copied ? "Copiado!" : "Copiar"}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium transition-colors border border-gray-200 text-sm"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}
