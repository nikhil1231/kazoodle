import "./MainPage.css";

import { Alert, Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { useState, useEffect } from "react";
import { getCurrentSong, getSongLink } from "../api";
import { GameOverModal } from "../components/main/GameOverModal";
import { AudioPlayer } from "../components/main/AudioPlayer";
import { SongPicker } from "../components/common/SongPicker";

// The sections for playback that you can skip to. The audio clip is trimmed to the last number.
const MAX_CLIP_LENGTH_SECS = 16;
const SECTIONS = [0, 1, 2, 4, 7, 11, MAX_CLIP_LENGTH_SECS];
const NUM_GUESSES = SECTIONS.length - 1;
const SKIP_GUESS = "SKIPPED";

export const MainPage: React.FC = () => {
  const [currentGuess, setCurrentGuess] = useState("");
  const [songSearchValue, setSongSearchValue] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [guessIds, setGuessIds] = useState<string[]>([]);
  const [songLink, setSongLink] = useState("");
  const [answer, setAnswer] = useState<Song>();
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);

  const loadSong = async () => {
    getSongLink()
      .then((s) => {
        if (s) {
          setSongLink(s);
        } else {
          setGameOver(true);
          alert(
            "Sorry, there isn't a song available today. Come back tomorrow."
          );
        }
      })
      .catch((e) =>
        alert("Error connecting to server, please try again later.")
      );

    getCurrentSong().then((s) => {
      setAnswer(s);
    });
  };

  const isGuessCorrect = (guess: string): boolean => {
    if (answer === undefined) {
      return false;
    }
    return guess === answer.id;
  };

  const submitGuess = (guess: string, guessText: string) => {
    if (gameOver || answer === undefined) {
      return;
    }
    if (isGuessCorrect(guess)) {
      setGameWon(true);
      setGameOver(true);
      setShowGameOverModal(true);
    } else {
      incrementSection();
    }
    if (guesses.length === NUM_GUESSES - 1) {
      setGameOver(true);
      setShowGameOverModal(true);
    }
    setCurrentGuess("");
    setSongSearchValue("");
    setGuesses([...guesses, guessText]);
    setGuessIds([...guessIds, guess]);
  };

  const getAlertVariant = (guess: string) => {
    if (isGuessCorrect(guess)) {
      return "success";
    } else if (guess === SKIP_GUESS) {
      return "info";
    } else {
      return "danger";
    }
  };

  const incrementSection = () =>
    setCurrentSection((s) => Math.min(s + 1, SECTIONS.length));

  const handleSkip = () => {
    submitGuess(SKIP_GUESS, SKIP_GUESS);
  };

  useEffect(() => {
    loadSong();
  }, []);

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand>Kazoodle</Navbar.Brand>
        </Container>
      </Navbar>
      <Container>
        <br />
        {guesses.map((guess, i) => (
          <Alert key={i} variant={getAlertVariant(guessIds[i])}>
            {guess}
          </Alert>
        ))}
        {Array.from({ length: NUM_GUESSES - guesses.length }, (_, i) => (
          <Alert key={i} variant="light">
            <span className="invisible">.</span>
          </Alert>
        ))}
        <AudioPlayer
          src={songLink}
          sections={SECTIONS}
          currentSection={currentSection}
          handleSkip={() => handleSkip()}
        />
        <SongPicker
          disabled={gameOver}
          searchValue={songSearchValue}
          setSearchValue={setSongSearchValue}
          setSongId={setCurrentGuess}
        />
        <br />
        <Button
          disabled={gameOver || currentGuess.length === 0}
          onClick={() => submitGuess(currentGuess, songSearchValue)}
        >
          Submit
        </Button>
      </Container>
      <GameOverModal
        show={showGameOverModal}
        gameWon={gameWon}
        handleClose={() => setShowGameOverModal(false)}
      />
    </div>
  );
};
