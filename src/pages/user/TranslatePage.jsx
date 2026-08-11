import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "ru", label: "Russian" },
    { code: "uk", label: "Ukrainian" },
    { code: "ar", label: "Arabic" },
    { code: "si", label: "Sinhala" },
    { code: "hi", label: "Hindi" },
    { code: "zh", label: "Chinese" },
];

export default function TranslatePage() {
    const [text, setText] = useState("");
    const [translated, setTranslated] = useState("");
    const [source, setSource] = useState("en");
    const [target, setTarget] = useState("ru");
    const [loading, setLoading] = useState(false);

    const handleTranslate = async () => {
        if (!text.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/translate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text,
                    source,
                    target,
                }),
            });

            const data = await res.json();
            setTranslated(data.translated || "");
        } catch (err) {
            console.error(err);
            setTranslated("Error translating text");
        } finally {
            setLoading(false);
        }
    };

    const swapLanguages = () => {
        setSource(target);
        setTarget(source);
        setText(translated);
        setTranslated("");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white shadow-xl rounded-2xl w-full max-w-3xl p-6 space-y-6">

                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-gray-800">
                    🌍 Translator
                </h1>

                {/* Language Select */}
                <div className="flex items-center gap-4">
                    <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={swapLanguages}
                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        ⇄
                    </button>

                    <select
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Input */}
                <div>
          <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
              className="w-full h-32 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
                </div>

                {/* Button */}
                <button
                    onClick={handleTranslate}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition"
                >
                    {loading ? "Translating..." : "Translate"}
                </button>

                {/* Output */}
                <div>
          <textarea
              value={translated}
              readOnly
              placeholder="Translation..."
              className="w-full h-32 p-3 border rounded-xl bg-gray-50"
          />
                </div>
            </div>
        </div>
    );
}