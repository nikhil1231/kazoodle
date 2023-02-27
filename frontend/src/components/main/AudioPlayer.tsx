import "./AudioPlayer.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { MdPauseCircleOutline, MdPlayCircleOutline } from "react-icons/md";
import { ProgressBar } from "./ProgressBar";

// The sections for playback that you can skip to. The audio clip is trimmed to the last number.
const MAX_CLIP_LENGTH = 16;
const SECTIONS = [0, 1, 2, 4, 7, 11, MAX_CLIP_LENGTH];
const PROGRESS_BAR_RESOLUTION = 1000;

export const AudioPlayer: React.FC<AudioPlayerProps> = (
  props: AudioPlayerProps
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);
  let playAnimationRef = useRef(0);

  const getProgressBarValue = (a: number) =>
    Math.round((100 * a * PROGRESS_BAR_RESOLUTION) / MAX_CLIP_LENGTH) /
    PROGRESS_BAR_RESOLUTION;

  const isPastMaxSection = (t: number) => t > SECTIONS[currentSection];

  const incrementSection = () =>
    setCurrentSection((s) => Math.min(s + 1, SECTIONS.length));

  const getNextSectionInterval = (i: number) =>
    i < SECTIONS.length - 1 ? SECTIONS[i + 1] - SECTIONS[i] : "";

  const repeat = useCallback(() => {
    const audio = audioRef.current;
    if (audio === null) {
      return;
    }

    if (isPastMaxSection(audio.currentTime)) {
      console.log(audio.currentTime, currentSection);

      return stopPlayback();
    }
    setProgress(getProgressBarValue(audio.currentTime));

    playAnimationRef.current = requestAnimationFrame(repeat);
  }, [audioRef, currentSection]);

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
        ghostPosition={getProgressBarValue(SECTIONS[currentSection])}
        sections={SECTIONS}
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
        onClick={() => incrementSection()}
        disabled={currentSection >= SECTIONS.length - 1}
      >
        Skip (+{getNextSectionInterval(currentSection)})
      </Button>
      <audio src={props.src} ref={audioRef} />
    </div>
  );
};

interface AudioPlayerProps {
  src: string;
}
