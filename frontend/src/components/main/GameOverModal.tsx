import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

export const GameOverModal: React.FC<GameOverModalProps> = (props: GameOverModalProps) => {

  return (
    <Modal show={props.show} onHide={props.handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Game over!</Modal.Title>
      </Modal.Header>
      <Modal.Body>Sorry, you didn't guess the song. :(</Modal.Body>
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
  handleClose: () => void;
}