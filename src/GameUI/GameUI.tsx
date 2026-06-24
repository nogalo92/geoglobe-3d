import { useState, type SubmitEvent } from "react";

import {
  S_guessedCountries,
  S_selectedCountry,
  S_secretCountry,
  submitCountryGuess,
  startNewGame,
} from "@game";

import "./gameUI.scss";
import { useSignalValue } from "@hooks/useSignalValue";

function GameUI() {
  const [input, setInput] = useState("");

  const guesses = useSignalValue(S_guessedCountries);
  const selectedCountry = useSignalValue(S_selectedCountry);
  const secretCountry = useSignalValue(S_secretCountry);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = input.trim();
    if (!value) return;

    submitCountryGuess(value);
    setInput("");
  };

  return (
    <div className="game-ui">
      <div className="game-ui__panel">
        <h1>Globle</h1>

        <form onSubmit={handleSubmit} className="game-ui__form">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Guess a country..."
          />

          <button type="submit">Guess</button>
        </form>

        {selectedCountry && <p>Selected: {selectedCountry.name}</p>}

        <button type="button" onClick={startNewGame}>
          New Game
        </button>

        <div>
          <h2>Guesses</h2>

          {guesses.map((guess) => (
            <div key={guess.id}>{guess.name}</div>
          ))}
        </div>

        {import.meta.env.DEV && secretCountry && (
          <p>Debug secret: {secretCountry.name}</p>
        )}
      </div>
    </div>
  );
}

export default GameUI;
