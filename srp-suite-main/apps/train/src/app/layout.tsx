import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "SRP Train — Capacitación Interactiva de Seguridad",
    description:
        "App interactiva de capacitación en seguridad minera con IA. Consulta normativas, practica con quizzes adaptativos y simula escenarios de riesgo.",
    keywords: [
        "seguridad minera",
        "capacitación",
        "SRP",
        "RAFT",
        "DS 132",
        "ECF",
        "training",
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
