"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [debug, setDebug] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setDebug("Intentando iniciar sesión...");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const supabase = createClient();

        setDebug(`Conectando con Supabase para: ${email}`);

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setDebug(`Error: ${signInError.message} (código: ${signInError.status})`);
            if (signInError.message === "Invalid login credentials") {
                setError("Correo o contraseña incorrectos. Verifica tus datos.");
            } else if (signInError.message.includes("Email not confirmed")) {
                setError("Debes confirmar tu correo electrónico en tu bandeja de entrada antes de continuar.");
            } else {
                setError(signInError.message);
            }
            setLoading(false);
            return;
        }

        if (data.user) {
            setDebug(`Sesión iniciada como: ${data.user.email}. Redirigiendo...`);
            // Force a hard navigation so middleware picks up the new cookies
            window.location.href = "/admin";
        } else {
            setDebug("Login sin error pero sin usuario. Intenta de nuevo.");
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#F5F5F0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
            }}
        >
            <div
                style={{
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    padding: "2.5rem",
                    width: "100%",
                    maxWidth: "420px",
                    border: "1px solid #E7E5E4",
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div
                        style={{
                            width: "52px",
                            height: "52px",
                            background: "#D4A517",
                            borderRadius: "8px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "1rem",
                        }}
                    >
                        <span style={{ color: "white", fontWeight: "bold", fontSize: "1.5rem" }}>N</span>
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1C1917", margin: 0 }}>
                        El Narrador — Admin
                    </h1>
                    <p style={{ color: "#78716C", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                        Ingresa tus credenciales para continuar
                    </p>
                </div>

                {error && (
                    <div
                        style={{
                            background: "#FEF2F2",
                            border: "1px solid #FECACA",
                            color: "#DC2626",
                            borderRadius: "8px",
                            padding: "0.75rem 1rem",
                            marginBottom: "1.25rem",
                            fontSize: "0.875rem",
                        }}
                    >
                        {error}
                    </div>
                )}

                {debug && (
                    <div
                        style={{
                            background: "#F0FDF4",
                            border: "1px solid #BBF7D0",
                            color: "#166534",
                            borderRadius: "8px",
                            padding: "0.75rem 1rem",
                            marginBottom: "1.25rem",
                            fontSize: "0.8rem",
                            fontFamily: "monospace",
                        }}
                    >
                        🔍 {debug}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                        <label
                            htmlFor="email"
                            style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#44403C", marginBottom: "0.5rem" }}
                        >
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            defaultValue="cesaradrian660@gmail.com"
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                border: "1.5px solid #E7E5E4",
                                borderRadius: "8px",
                                fontSize: "0.9rem",
                                color: "#1C1917",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#44403C", marginBottom: "0.5rem" }}
                        >
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                border: "1.5px solid #E7E5E4",
                                borderRadius: "8px",
                                fontSize: "0.9rem",
                                color: "#1C1917",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "0.875rem",
                            background: loading ? "#A8A29E" : "#1C1917",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            cursor: loading ? "not-allowed" : "pointer",
                            marginTop: "0.5rem",
                        }}
                    >
                        {loading ? "Iniciando sesión..." : "Entrar al Panel"}
                    </button>
                </form>
            </div>
        </div>
    );
}
