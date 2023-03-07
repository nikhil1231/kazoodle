import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  uploadSong,
  getUserResponse,
  getSongHistory,
  getSongQueue,
  uploadSongNew,
} from "../api";
import { SongList } from "../components/admin/SongList";
import { getCurrentSong } from "../api";
import { SongPicker } from "../components/common/SongPicker";
import { Button, Container } from "react-bootstrap";

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [songId, setSongId] = useState("");
  const [songSearchValue, setSongSearchValue] = useState("");
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [checkedLogin, hasCheckedLogin] = useState(false);

  const [songCurrent, setSongCurrent] = useState<Song | null>(null);
  const [songQueueList, setSongQueueList] = useState<Song[]>([]);
  const [songHistoryList, setSongHistoryList] = useState<Song[]>([]);

  useEffect(() => {
    (async () => {
      await checkLogin();
      setSongLists();
    })();
  }, []);

  const checkLogin = async () => {
    const res = await getUserResponse();

    if (res.status === 401 || res.status === 403) {
      navigate("/login");
    }

    const user = await res.json();
    if (user.priv < 1) {
      navigate("/");
    }

    hasCheckedLogin(true);
  };

  const setSongLists = async () => {
    getCurrentSong().then((s) => setSongCurrent(s));
    getSongQueue().then((ss) => setSongQueueList(ss));
    getSongHistory().then((ss) => setSongHistoryList(ss));
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

    uploadFormData.append("file", selectedFile);
    if (songId.length > 0) {
      uploadFormData.append("song_id", songId);
      await uploadSong(uploadFormData);
    } else {
      uploadFormData.append("song_name", songName);
      uploadFormData.append("artist", artist);
      await uploadSongNew(uploadFormData);
    }

    setSongName("");
    setArtist("");
    setSongId("");
    setSongSearchValue("");
    setIsFilePicked(false);
    setSongLists();
  };

  return (
    <Container>
      {checkedLogin && (
        <>
          <h1>Admin page</h1>

          <div>
            <input
              type="file"
              name="file"
              accept="audio/x-wav, audio/mp4"
              onChange={onUploadFileChange}
            />
            <br />
            <br />
            <div>
              <h5>Find song in database:</h5>
              <SongPicker
                disabled={false}
                searchValue={songSearchValue}
                setSearchValue={setSongSearchValue}
                setSongId={(s) => {
                  setSongId(s);
                  setSongName("");
                  setArtist("");
                }}
              />
            </div>
            <div>
              <br />
              <h5>Or tag manually:</h5>
              <input
                placeholder="Song name"
                value={songName}
                onChange={(e) => {
                  setSongId("");
                  setSongSearchValue("");
                  setSongName(e.target.value);
                }}
              />
              <input
                placeholder="Artist"
                value={artist}
                onChange={(e) => {
                  setSongId("");
                  setSongSearchValue("");
                  setArtist(e.target.value);
                }}
              />
            </div>
            <br />
            <Button
              onClick={onUploadFileClick}
              disabled={
                !(
                  isFilePicked &&
                  ((songName.length > 0 && artist.length > 0) ||
                    songId.length > 0)
                )
              }
            >
              Upload
            </Button>
          </div>
          <br />

          <SongList
            title="Current song"
            songs={songCurrent ? [songCurrent] : []}
          />
          <SongList title="Queue" songs={songQueueList} />
          <SongList title="Past songs" songs={songHistoryList} />
        </>
      )}
    </Container>
  );
};
