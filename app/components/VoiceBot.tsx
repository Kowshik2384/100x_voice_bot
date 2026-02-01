"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ===== Types =====
type BotStatus = "idle" | "listening" | "processing" | "speaking" | "error";

// ===== Microphone Icon Component =====
const MicrophoneIcon = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
);

// ===== Speaker Icon Component =====
const SpeakerIcon = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
);

// ===== Stop Icon Component =====
const StopIcon = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
);

// ===== Voice Bot Component =====
export default function VoiceBot() {
    // State management
    const [status, setStatus] = useState<BotStatus>("idle");
    const [transcript, setTranscript] = useState<string>("");
    const [response, setResponse] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isSupported, setIsSupported] = useState<boolean>(true);

    // Refs for speech recognition and synthesis
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isListeningRef = useRef<boolean>(false);

    // Check browser support on mount
    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition || !window.speechSynthesis) {
            setIsSupported(false);
            setError("Your browser doesn't support speech features. Please use Chrome or Edge.");
        }

        // Load voices
        window.speechSynthesis.getVoices();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    // ===== Text-to-Speech Function =====
    const speakResponse = useCallback((text: string) => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Configure voice settings for natural sound
        utterance.rate = 0.95; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to find a natural-sounding voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
            (v) => v.lang.startsWith("en") && v.name.includes("Natural")
        ) || voices.find((v) => v.lang.startsWith("en-US")) || voices.find((v) => v.lang.startsWith("en"));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setStatus("speaking");
        utterance.onend = () => setStatus("idle");
        utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            setStatus("idle");
        };

        synthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, []);

    // ===== Send to API and Get Response =====
    const getAIResponse = useCallback(async (userMessage: string) => {
        setStatus("processing");
        setError("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to get response");
            }

            const data = await res.json();
            setResponse(data.response);

            // Speak the response
            speakResponse(data.response);
        } catch (err) {
            setStatus("error");
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        }
    }, [speakResponse]);

    // ===== Start Listening =====
    const startListening = useCallback(() => {
        // Prevent multiple simultaneous sessions
        if (isListeningRef.current) return;

        setError("");
        setTranscript("");

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        // Stop any existing recognition
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                // Ignore
            }
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log("Speech recognition started");
            isListeningRef.current = true;
            setStatus("listening");
            setError("");
        };

        recognition.onresult = (event) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Update display with interim or final
            const displayText = finalTranscript || interimTranscript;
            if (displayText) {
                setTranscript(displayText);
            }

            // If we have a final result, send to API
            if (finalTranscript) {
                console.log("Final transcript:", finalTranscript);
                isListeningRef.current = false;
                getAIResponse(finalTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            isListeningRef.current = false;

            switch (event.error) {
                case "no-speech":
                    setError("No speech detected. Please speak clearly and try again.");
                    break;
                case "not-allowed":
                case "permission-denied":
                    setError("Microphone access denied. Please allow microphone permission in your browser settings.");
                    break;
                case "network":
                    setError("Network error. Please check your internet connection.");
                    break;
                case "aborted":
                    // User cancelled - not really an error
                    if (status === "listening") {
                        setError("Recording stopped. Click the microphone to try again.");
                    }
                    break;
                case "audio-capture":
                    setError("No microphone found. Please connect a microphone and try again.");
                    break;
                default:
                    setError(`Speech recognition error: ${event.error}. Please try again.`);
            }
            setStatus("error");
        };

        recognition.onend = () => {
            console.log("Speech recognition ended");
            isListeningRef.current = false;

            // Only reset if we didn't transition to another state
            setStatus((current) => {
                if (current === "listening") {
                    return "idle";
                }
                return current;
            });
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
            console.log("Recognition start called");
        } catch (err) {
            console.error("Failed to start recognition:", err);
            setError("Failed to start voice recognition. Please refresh and try again.");
            setStatus("error");
        }
    }, [getAIResponse, status]);

    // ===== Stop Current Action =====
    const stopAction = useCallback(() => {
        isListeningRef.current = false;

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore
            }
        }
        window.speechSynthesis.cancel();
        setStatus("idle");
        setError("");
    }, []);

    // ===== Handle Button Click =====
    const handleButtonClick = useCallback(() => {
        if (status === "idle" || status === "error") {
            startListening();
        } else {
            stopAction();
        }
    }, [status, startListening, stopAction]);

    // ===== Get Status Text =====
    const getStatusText = (): string => {
        switch (status) {
            case "listening":
                return "Listening... Speak now";
            case "processing":
                return "Thinking...";
            case "speaking":
                return "Speaking...";
            case "error":
                return "Error occurred";
            default:
                return "Tap to speak";
        }
    };

    // ===== Get Button Icon =====
    const getButtonIcon = () => {
        switch (status) {
            case "speaking":
                return <SpeakerIcon />;
            case "listening":
            case "processing":
                return <StopIcon />;
            default:
                return <MicrophoneIcon />;
        }
    };

    // ===== Render =====
    return (
        <main className="main-container">
            <header className="header">
                <h1>Voice Bot</h1>
                <p>Ask me anything about my background, experience, and personality</p>
            </header>

            <div className="voice-bot-card">
                <div className="mic-container">
                    {/* Microphone Button */}
                    <button
                        className={`mic-button ${status}`}
                        onClick={handleButtonClick}
                        disabled={!isSupported}
                        aria-label={getStatusText()}
                    >
                        {getButtonIcon()}
                    </button>

                    {/* Status Indicator */}
                    <div className="status-indicator">
                        <span className={`status-dot ${status}`} />
                        <span className="status-text">{getStatusText()}</span>
                    </div>
                </div>

                {/* Transcript Section */}
                {(transcript || response) && (
                    <div className="transcript-section">
                        {/* User's Question */}
                        {transcript && (
                            <div className="transcript-box">
                                <div className="transcript-label">Your Question</div>
                                <p className="transcript-text">{transcript}</p>
                            </div>
                        )}

                        {/* AI Response */}
                        {response && (
                            <div className="transcript-box response-box">
                                <div className="transcript-label">My Answer</div>
                                <p className="transcript-text">{response}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {error && <div className="error-message">{error}</div>}

                {/* Browser Support Notice */}
                {!isSupported && (
                    <div className="browser-notice">
                        <p>⚠️ Please use Chrome or Edge for the best experience with voice features.</p>
                    </div>
                )}

                {/* Instructions */}
                <div className="instructions">
                    <p>Click the microphone and ask an interview question.</p>
                    <p>I&apos;ll respond with my voice, just like in a real conversation.</p>
                </div>
            </div>

            <footer className="footer">
                <p> • Voice Bot</p>
            </footer>
        </main>
    );
}
