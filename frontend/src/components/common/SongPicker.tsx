import "./SongPicker.css";
import { Form, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import { getSongList } from "../../api";
import fuzzysort from "fuzzysort";

const MAX_SEARCH_RESULTS = 10;

export const SongPicker: React.FC<SongPickerProps> = (
  props: SongPickerProps
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [songList, setSongList] = useState<Song[]>([]);

  const updateSearchResults = (searchStr: string) => {
    props.setSearchValue(searchStr);
    if (searchStr.length < 1) {
      setIsOpen(false);
      return;
    }

    const results = fuzzysort.go(searchStr, songList, {
      keys: ["name", "artist"],
      limit: MAX_SEARCH_RESULTS,
    });

    setSearchResults(results.map((res) => res.obj));

    setIsOpen(true);
  };

  const handleClick = (song: Song) => {
    setSearchResults([]);
    setIsOpen(false);
    props.setSearchValue(`${song.name} - ${song.artist}`);
    props.setSongId(song.id);
  };

  const handleSearchClick = () => {
    setSearchResults([]);
    setIsOpen(false);
    props.setSearchValue("");
    props.setSongId("");
  };

  useEffect(() => {
    getSongList().then((list) => setSongList(list));
  }, []);

  return (
    <Form.Group className="">
      <Form.Control
        disabled={props.disabled}
        value={props.searchValue}
        onClick={() => handleSearchClick()}
        onChange={(e) => updateSearchResults(e.target.value)}
        placeholder="Search songs..."
      />
      {isOpen && (
        <Table>
          <tbody>
            {searchResults.map((res: Song) => (
              <tr key={res.id} onClick={() => handleClick(res)}>
                <td>
                  {res.name} - {res.artist}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Form.Group>
  );
};

interface SongPickerProps {
  disabled: boolean;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  setSongId: React.Dispatch<React.SetStateAction<string>>;
}
