import { useEffect, useState } from "react";

export const SongList: React.FC<SongListProps> = (props: SongListProps) => {
  return (
    <div>
      <h3>{props.title}</h3>
      {props.songs.map((song: Song, i: number) => (
        <div key={song.filename}>{`${i + 1}. ${song.name} - ${
          song.artist
        }`}</div>
      ))}
    </div>
  );
};

interface SongListProps {
  title: string;
  songs: Song[];
}
