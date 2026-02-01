import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Voice Interview Bot | Ask Me Anything",
    description: "An AI-powered voice bot that answers interview questions as me, in first person with my personality and background.",
    keywords: ["interview", "AI", "voice bot", "speech", "personality"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body>{children}</body>
        </html>
    );
}
