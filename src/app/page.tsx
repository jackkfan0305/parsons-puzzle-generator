"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { usePuzzle, Block } from "./context/puzzleContext";

export default function Home() {
  const router = useRouter();
  const { setBlocks } = usePuzzle();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyError, setKeyError] = useState("");

  useEffect(() => {
    // Check if API key exists in local storage
    const storedApiKey = localStorage.getItem("openai_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleGenerate = async () => {
    // Check if API key exists
    const storedApiKey = localStorage.getItem("openai_api_key");

    if (!storedApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generatePuzzle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": storedApiKey,
        },
        body: JSON.stringify({ prompt }),
      });
      const data: Block[] = await res.json();
      setBlocks(data);
      router.push("/puzzle");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim().startsWith("sk-")) {
      setKeyError("API key should start with 'sk-'");
      return;
    }

    const isValid = await validateApiKey(apiKey);
    if (isValid) {
      localStorage.setItem("openai_api_key", apiKey);
      setShowApiKeyModal(false);
      handleGenerate();
    }
  };

  const validateApiKey = async (key: string) => {
    setValidatingKey(true);
    setKeyError("");

    try {
      const response = await fetch("/api/validateKey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });

      const data = await response.json();

      if (!response.ok) {
        setKeyError(data.error || "Invalid API key");
        return false;
      }

      return true;
    } catch (error) {
      setKeyError("Error validating API key");
      return false;
    } finally {
      setValidatingKey(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6">
        <textarea
          className="w-full h-40 p-4 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Describe the programming task that you want to be solved..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 transition"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-lg p-6 w-96">
            <h2 className="text-lg text-black font-bold mb-4">
              Enter your OpenAI API Key
            </h2>
            <p className="text-sm text-black mb-4">
              Your API key will be stored locally in your browser and never sent
              to our servers.
            </p>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 text-black rounded mb-4"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {keyError && (
              <p className="text-red-500 text-sm mb-4">{keyError}</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-black rounded"
                onClick={() => setShowApiKeyModal(false)}
              >
                Cancel
              </button>
              {validatingKey ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Validating...
                </>
              ) : (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleSaveApiKey}
                >
                  Save & Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
