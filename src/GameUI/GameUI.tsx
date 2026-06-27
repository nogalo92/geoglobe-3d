import { useState, type SubmitEvent } from "react";

import "./gameUI.scss";

import { useSignalValue } from "@hooks/useSignalValue";
import { S_gameManager } from "@gameSignals";
import { rotateToCountry } from "@earthUtils";
import type { CountryFeature } from "@countryTypes";
import { S_emptyCountry, S_emptyGuesses } from "@gameSignalsUI";

function GameUI() {
  const [input, setInput] = useState("");

  const gameManager = useSignalValue(S_gameManager);

  const [inputStatus, setInputStatus] = useState<
    "idle" | "duplicate" | "unknown" | "no-target"
  >("idle");

  const [message, setMessage] = useState("");

  const guesses = useSignalValue(gameManager?.guesses ?? S_emptyGuesses);
  const selectedCountry = useSignalValue(
    gameManager?.selectedCountry ?? S_emptyCountry,
  );
  const secretCountry = useSignalValue(
    gameManager?.targetCountry ?? S_emptyCountry,
  );
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = input.trim();
    if (!value || !gameManager) return;

    const result = gameManager.submitGuess(value);

    switch (result.status) {
      case "accepted": {
        if (result.guess.isCorrect) {
          // TODO: play victory animation
          // TODO: reveal answer
          // TODO: end game
          alert("WIN");
        }

        rotateToCountry(result.guess.country);
        setInput("");
        setInputStatus("idle");
        setMessage("");
        break;
      }

      case "duplicate": {
        setInputStatus("duplicate");
        setMessage(`Already guessed ${result.country.properties.displayName}.`);
        break;
      }

      case "unknown":
        setMessage(`Unknown country: ${value}`);
        break;

      case "no-target": {
        setInputStatus("no-target");
        setMessage("Start a new game first.");
        break;
      }
    }

    window.setTimeout(() => {
      setInputStatus("idle");
      setMessage("");
    }, 1800);
  };

  const handleNewGame = () => {
    gameManager?.startNewGame();
  };

  const handleGuessClick = (country: CountryFeature) => {
    gameManager?.selectCountry(country);
    rotateToCountry(country);
  };

  return (
    <div className="game-ui">
      <div className="game-ui__panel">
        <h1>Globle</h1>

        <form onSubmit={handleSubmit} className="game-ui__form">
          <input
            className={`game-ui__input ${
              inputStatus !== "idle" ? "game-ui__input--shake" : ""
            }`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Guess a country..."
          />
          {message && <p className="game-ui__message">{message}</p>}

          <button type="submit" disabled={!gameManager}>
            Guess
          </button>
        </form>

        {selectedCountry && (
          <p>Selected: {selectedCountry.properties.displayName}</p>
        )}

        <button type="button" onClick={handleNewGame} disabled={!gameManager}>
          New Game
        </button>

        <div>
          <h2>Guesses</h2>

          {guesses.map((guess) => (
            <button
              key={guess.country.properties.id}
              type="button"
              onClick={() => handleGuessClick(guess.country)}
            >
              {guess.country.properties.displayName} — {guess.distanceKm} km
            </button>
          ))}
        </div>

        {import.meta.env.DEV && secretCountry && (
          <p>Debug secret: {secretCountry.properties.displayName}</p>
        )}
      </div>
    </div>
  );
}

export default GameUI;
