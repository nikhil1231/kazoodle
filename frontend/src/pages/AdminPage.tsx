import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [checkedLogin, hasCheckedLogin] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/me`, {
      method: "GET",
      credentials: "include",
    });

    if (res.status === 401 || res.status === 403) {
      navigate("/login");
    }

    const user = await res.json();
    if (user.priv < 1) {
      navigate("/");
    }

    hasCheckedLogin(true);
  };

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
      credentials: "include",
      body: uploadFormData,
    });

    setSongName("");
    setArtist("");
    setIsFilePicked(false);
  };

  return (
    <div>
      {checkedLogin && (
        <>
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
        </>
      )}
    </div>
  );
};
