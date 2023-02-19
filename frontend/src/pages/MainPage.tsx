import { Alert, Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import { useState, useEffect } from "react";
import { getCurrentSong } from "../api";
import { GameOverModal } from "../components/main/GameOverModal";
import fuzzysort from "fuzzysort";

const NUM_GUESSES = 3;
const GUESS_FUZZINESS_THRESHOLD = -10; // 0 is exact match, lower is worse
const GUESS_TEST_FILTER_REGEX = /[^\w\s!?]/g;

export const MainPage: React.FC = () => {
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [answer, setAnswer] = useState<Song>();
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);

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

  const submitGuess = () => {
    if (gameOver || answer === undefined) {
      return;
    }
    if (isGuessCorrect(currentGuess)) {
      setGameWon(true);
      setGameOver(true);
    }
    if (guesses.length === NUM_GUESSES - 1) {
      setGameOver(true);
      setShowGameOverModal(true);
    }
    setCurrentGuess("");
    setGuesses([...guesses, currentGuess]);
  };

  useEffect(() => {
    getCurrentSong()
      .then((s) => {
        setAnswer(s);
      })
      .catch((e) =>
        alert("Error connecting to server, please try again later.")
      );
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
          <Alert
            key={guess}
            variant={isGuessCorrect(guess) ? "success" : "danger"}
          >
            {guess}
          </Alert>
        ))}
        {Array.from({ length: NUM_GUESSES - guesses.length }, (_, i) => (
          <Alert key={i} variant="light">
            .
          </Alert>
        ))}
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control
            disabled={gameOver}
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value)}
            placeholder="Guess the song..."
          />
        </Form.Group>
        <Button disabled={gameOver} onClick={() => submitGuess()}>
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
