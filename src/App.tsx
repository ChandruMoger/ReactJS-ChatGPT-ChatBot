import { useState, useTransition, useEffect, useRef } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
const API_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = "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";
function App() {
  const [search, setSearch] = useState("");
  const controller = useRef(null);
  const [searchResponse, setSearchResponse] = useState("");
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const generate = async () => {
    // Alert the user if no prompt value
    if (!search) {
      alert("Please enter a prompt.");
      return;
    }

    // Disable the generate button and enable the stop button
    // generateBtn.disabled = true;
    // stopBtn.disabled = false;
    // resultText.innerText = "Generating...";
    setSearchResponse("Generating");
    setSearching(true);
    // Create a new AbortController instance
    controller.current = new AbortController();
    console.log("controller", controller.current);
    const signal = controller.current.signal;
    //   startTransition(() => {
    //     setQuery(e.target.value);
    // });
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: promptInput.value }],
          max_tokens: 100,
          stream: true, // For streaming responses
        }),
        signal, // Pass the signal to the fetch request
      });

      // Read the response as a stream of data
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      setSearchResponse("");

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        const parsedLines = lines
          .map((line) => line.replace(/^data: /, "").trim()) 
          .filter((line) => line !== "" && line !== "[DONE]") 
          .map((line) => JSON.parse(line));

        for (const parsedLine of parsedLines) {
          const { choices } = parsedLine;
          const { delta } = choices[0];
          const { content } = delta;
          if (content) {
            setSearchResponse(prev => prev + content);
          }
        }
      }
    } catch (error) {
      // Handle fetch request errors
      if (signal.aborted) {
        setSearchResponse("Request aborted.");
      } else {
        console.error("Error:", error);
        setSearchResponse("Error occurred while generating.");
      }
      setSearching(false);
    } finally {
      setSearching(false);
      controller.current = null; // Reset the AbortController instance
    }
  };

  const stop = () => {
    console.log("controller", controller.current);
    // Abort the fetch request by calling abort() on the AbortController instance
    if (controller.current) {
      controller.current.abort();
      controller.current = null;
      setSearching(false);
    }
  };

  return (
    <>
      <div className="max-w-lg p-8 rounded-md bg-gray-100 shadow">
        <h1 className="text-3xl text-emerald-800 font-bold mb-6">
          Chat GPT Chat Bot By Chandra
        </h1>
        <div id="resultContainer" className="mt-4 h-48 overflow-y-auto">
          <p className="text-gray-500 text-sm mb-2">Generated Text</p>
          <p className="whitespace-pre-line text-emerald-800">{searchResponse}</p>
        </div>
        <input
          type="text"
          id="promptInput"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-gray-200 placeholder-teal-500 focus:outline-none mt-4"
          placeholder="Enter prompt..."
        />
        <div className="flex justify-center mt-4">
          <button
            id="generateBtn"
            onClick={generate}
            disabled={searching}
            className="w-1/2 px-4 py-2 rounded-md bg-emerald-400 text-white hover:bg-emerald-500 focus:outline-none mr-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            Generate
          </button>
          <button
            id="stopBtn"
            onClick={stop}
            disabled={!searching}
            className="w-1/2 px-4 py-2 rounded-md border text-emerald-500 border-emerald-500 hover:text-emerald-700 hover:border-emerald-700 focus:outline-none ml-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            Stop
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
