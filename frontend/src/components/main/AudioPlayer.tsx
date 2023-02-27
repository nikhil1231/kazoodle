import "./AudioPlayer.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { MdPauseCircleOutline, MdPlayCircleOutline } from "react-icons/md";
import { ProgressBar } from "./ProgressBar";

const PROGRESS_BAR_RESOLUTION = 1000;

export const AudioPlayer: React.FC<AudioPlayerProps> = (
  props: AudioPlayerProps
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  let playAnimationRef = useRef(0);

  const getProgressBarValue = (a: number) =>
    Math.round(
      (100 * a * PROGRESS_BAR_RESOLUTION) /
        props.sections[props.sections.length - 1]
    ) / PROGRESS_BAR_RESOLUTION;

  const isPastMaxSection = (t: number) =>
    t > props.sections[props.currentSection];

  const getNextSectionInterval = (i: number) =>
    i < props.sections.length - 1
      ? props.sections[i + 1] - props.sections[i]
      : "";

  const repeat = useCallback(() => {
    const audio = audioRef.current;
    if (audio === null) {
      return;
    }

    if (isPastMaxSection(audio.currentTime)) {
      console.log(audio.currentTime, props.currentSection);

      return stopPlayback();
    }
    setProgress(getProgressBarValue(audio.currentTime));

    playAnimationRef.current = requestAnimationFrame(repeat);
  }, [audioRef, props.currentSection]);

  const startPlayback = () => {
    audioRef.current?.play();
    playAnimationRef.current = requestAnimationFrame(repeat);
  };

  const stopPlayback = () => {
    audioRef.current?.pause();
    audioRef.current!.currentTime = 0;
    setProgress(0);
    setIsPlaying(false);
    cancelAnimationFrame(playAnimationRef.current);
  };

  const handleSkip = () => {
    props.handleSkip();
  };

  useEffect(() => {
    if (isPlaying) {
      startPlayback();
    } else {
      stopPlayback();
    }
  }, [isPlaying, audioRef, repeat]);

  return (
    <div>
      <ProgressBar
        fillPosition={progress}
        ghostPosition={getProgressBarValue(
          props.sections[props.currentSection]
        )}
        sections={props.sections}
      />
      <Button
        className="audio-player-button audio-player-play-button"
        variant="success"
        onClick={() => setIsPlaying((p) => !p)}
      >
        {isPlaying ? <MdPauseCircleOutline /> : <MdPlayCircleOutline />}
      </Button>
      <Button
        className="audio-player-button"
        variant="secondary"
        onClick={() => handleSkip()}
        disabled={props.currentSection >= props.sections.length - 1}
      >
        Skip (+{getNextSectionInterval(props.currentSection)})
      </Button>
      <audio src={props.src} ref={audioRef} />
    </div>
  );
};

interface AudioPlayerProps {
  src: string;
  sections: number[];
  currentSection: number;
  handleSkip: () => void;
}
