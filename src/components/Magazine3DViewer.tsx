"use client";

import { useState } from "react";

type Props = {
    coverUrl: string;
    title: string;
    edition?: string;
};

export default function Magazine3DViewer({ coverUrl, title, edition }: Props) {
    const [hovered, setHovered] = useState(false);

    const COVER_W = 260;
    const COVER_H = 360;
    const SPINE_W = 28;

    return (
        <div className="flex flex-col items-center py-8">
            <p className="text-sm text-gray-400 mb-6 uppercase tracking-widest font-medium">Vista 3D</p>

            {/* Perspective container */}
            <div
                style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="cursor-pointer select-none"
                role="img"
                aria-label={`Vista 3D de la revista ${title}`}
            >
                {/* Book group */}
                <div
                    style={{
                        position: "relative",
                        width: `${COVER_W + SPINE_W}px`,
                        height: `${COVER_H}px`,
                        transformStyle: "preserve-3d",
                        transform: hovered
                            ? "rotateX(4deg) rotateY(-25deg)"
                            : "rotateX(2deg) rotateY(-18deg)",
                        transition: "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
                        filter: "drop-shadow(12px 20px 28px rgba(0,0,0,0.45))",
                    }}
                >
                    {/* ── Spine (left face) ── */}
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: `${SPINE_W}px`,
                            height: `${COVER_H}px`,
                            transformOrigin: "right center",
                            transform: `rotateY(-90deg) translateX(-${SPINE_W / 2}px)`,
                            background: "linear-gradient(180deg, #1a0a00 0%, #5c2d00 30%, #3d1f00 60%, #1a0a00 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                        }}
                    >
                        {/* Spine text (rotated) */}
                        <span
                            style={{
                                color: "rgba(255,210,100,0.85)",
                                fontSize: "9px",
                                fontWeight: 700,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                                maxHeight: `${COVER_H - 20}px`,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                padding: "8px 0",
                            }}
                        >
                            {title}
                        </span>
                    </div>

                    {/* ── Front cover ── */}
                    <div
                        style={{
                            position: "absolute",
                            left: `${SPINE_W}px`,
                            top: 0,
                            width: `${COVER_W}px`,
                            height: `${COVER_H}px`,
                            transformOrigin: "left center",
                            borderRadius: "0 3px 3px 0",
                            overflow: "hidden",
                            backfaceVisibility: "hidden",
                        }}
                    >
                        {coverUrl ? (
                            <img
                                src={coverUrl}
                                alt={title}
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                        ) : (
                            /* Placeholder when no cover image */
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    background: "linear-gradient(135deg, #92400e 0%, #d97706 50%, #92400e 100%)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "24px",
                                    gap: "12px",
                                }}
                            >
                                <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: 800, textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.3 }}>
                                    {title}
                                </div>
                                {edition && (
                                    <div style={{ color: "rgba(255,220,120,0.9)", fontSize: "11px", fontWeight: 500, textAlign: "center" }}>
                                        {edition}
                                    </div>
                                )}
                                {/* Decorative lines */}
                                <div style={{ width: "60%", height: "1px", background: "rgba(255,255,255,0.3)", marginTop: "8px" }} />
                                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                                    El Narrador
                                </div>
                            </div>
                        )}

                        {/* Gloss overlay */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: hovered
                                    ? "linear-gradient(120deg, rgba(255,255,255,0.14) 0%, transparent 55%)"
                                    : "linear-gradient(120deg, rgba(255,255,255,0.10) 0%, transparent 50%)",
                                transition: "background 0.4s ease",
                                pointerEvents: "none",
                            }}
                        />

                        {/* Left-edge shadow (page depth) */}
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: "18px",
                                height: "100%",
                                background: "linear-gradient(to right, rgba(0,0,0,0.28), transparent)",
                                pointerEvents: "none",
                            }}
                        />
                    </div>

                    {/* ── Top face ── */}
                    <div
                        style={{
                            position: "absolute",
                            left: `${SPINE_W}px`,
                            top: 0,
                            width: `${COVER_W}px`,
                            height: `${SPINE_W}px`,
                            transformOrigin: "bottom center",
                            transform: `rotateX(90deg) translateY(${SPINE_W / 2}px)`,
                            background: "linear-gradient(to right, #e5e0d8, #f5f0ea, #e5e0d8)",
                        }}
                    />

                    {/* ── Bottom face ── */}
                    <div
                        style={{
                            position: "absolute",
                            left: `${SPINE_W}px`,
                            bottom: 0,
                            width: `${COVER_W}px`,
                            height: `${SPINE_W}px`,
                            transformOrigin: "top center",
                            transform: `rotateX(-90deg) translateY(-${SPINE_W / 2}px)`,
                            background: "linear-gradient(to right, #d5d0c8, #e8e3dd, #d5d0c8)",
                        }}
                    />
                </div>
            </div>

            {/* Caption */}
            <div className="mt-6 text-center">
                <p className="text-gray-700 font-semibold text-base">{title}</p>
                {edition && <p className="text-amber-600 text-sm mt-0.5">{edition}</p>}
                <p className="text-gray-400 text-xs mt-2">Pasa el cursor para rotar</p>
            </div>
        </div>
    );
}
