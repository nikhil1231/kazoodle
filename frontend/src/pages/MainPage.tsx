import "./MainPage.css";

import { Alert, Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import { useState, useEffect } from "react";
import { getCurrentSong, getSongLink } from "../api";
import { GameOverModal } from "../components/main/GameOverModal";
import fuzzysort from "fuzzysort";
import { AudioPlayer } from "../components/main/AudioPlayer";

// The sections for playback that you can skip to. The audio clip is trimmed to the last number.
const MAX_CLIP_LENGTH_SECS = 16;
const SECTIONS = [0, 1, 2, 4, 7, 11, MAX_CLIP_LENGTH_SECS];
const NUM_GUESSES = SECTIONS.length - 1;
const GUESS_FUZZINESS_THRESHOLD = -10; // 0 is exact match, lower is worse
const GUESS_TEST_FILTER_REGEX = /[^\w\s!?]/g;
const SKIP_GUESS = "SKIPPED";

export const MainPage: React.FC = () => {
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [songLink, setSongLink] = useState("");
  const [answer, setAnswer] = useState<Song>();
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);

  const loadSong = async () => {
    getSongLink()
      .then((s) => {
        setSongLink(s);
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
    const res = fuzzysort.single(
      guess.replace(GUESS_TEST_FILTER_REGEX, ""),
      answer.name.replace(GUESS_TEST_FILTER_REGEX, "")
    );
    return res ? res.score > GUESS_FUZZINESS_THRESHOLD : false;
  };

  const submitGuess = (guess: string) => {
    if (gameOver || answer === undefined) {
      return;
    }
    if (isGuessCorrect(guess)) {
      setGameWon(true);
      setGameOver(true);
    } else {
      incrementSection();
    }
    if (guesses.length === NUM_GUESSES - 1) {
      setGameOver(true);
      setShowGameOverModal(true);
    }
    setCurrentGuess("");
    setGuesses([...guesses, guess]);
  };

  const getAlertVariant = (guess: string) => {
    if (isGuessCorrect(guess)) {
      return "success";
    } else if (guess == SKIP_GUESS) {
      return "info";
    } else {
      return "danger";
    }
  };

  const incrementSection = () =>
    setCurrentSection((s) => Math.min(s + 1, SECTIONS.length));

  const handleSkip = () => {
    submitGuess(SKIP_GUESS);
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
        {guesses.map((guess) => (
          <Alert key={guess} variant={getAlertVariant(guess)}>
            {guess}
          </Alert>
        ))}
        {Array.from({ length: NUM_GUESSES - guesses.length }, (_, i) => (
          <Alert key={i} variant="light">
            .
          </Alert>
        ))}
        <AudioPlayer
          src={songLink}
          sections={SECTIONS}
          currentSection={currentSection}
          handleSkip={() => handleSkip()}
        />
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control
            disabled={gameOver}
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value)}
            placeholder="Guess the song..."
          />
        </Form.Group>
        <Button disabled={gameOver} onClick={() => submitGuess(currentGuess)}>
          Submit
        </Button>
      </Container>
      <GameOverModal
        show={showGameOverModal}
        handleClose={() => setShowGameOverModal(false)}
      />
    </div>
  );
};
