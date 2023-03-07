import { Button, Modal } from "react-bootstrap";

export const GameOverModal: React.FC<GameOverModalProps> = (props: GameOverModalProps) => {

  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{props.gameWon ? "Congratulations!" : "Game over!"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.gameWon ? "Well done, you guessed the song!" : "Sorry, you didn't guess the song. :("}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

interface GameOverModalProps {
  show: boolean;
  gameWon: boolean;
  handleClose: () => void;
}