import { useState } from "react";

export const AdminPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");

  const onUploadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files !== null && files.length > 0) {
      setSelectedFile(files[0]);
      setIsFilePicked(true);
    }
  };

  const onUploadFileClick = async () => {
    if (!selectedFile) {
      alert("file not selected.");
      return;
    }

    const uploadFormData = new FormData();

    uploadFormData.append("song_name", songName);
    uploadFormData.append("artist", artist);
    uploadFormData.append("file", selectedFile);

    await fetch(`${process.env.REACT_APP_BACKEND_URL}/song/upload`, {
      method: "POST",
      body: uploadFormData,
    });

    setSongName("");
    setArtist("");
    setIsFilePicked(false);
  };

  return (
    <div>
      <h1>Admin page</h1>

      <input
        type="file"
        name="file"
        accept="audio/x-wav, audio/mp4"
        onChange={onUploadFileChange}
      />
      <input
        placeholder="Song name"
        value={songName}
        onChange={(e) => setSongName(e.target.value)}
      />
      <input
        placeholder="Artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
      />
      <button
        onClick={onUploadFileClick}
        disabled={!isFilePicked || songName == "" || artist == ""}
      >
        Upload
      </button>
    </div>
  );
};
