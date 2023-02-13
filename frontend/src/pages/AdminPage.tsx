import { useState } from "react";

export const AdminPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [fileName, setFileName] = useState("");

  const onUploadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files !== null && files.length > 0) {
      setSelectedFile(files[0]);
      setFileName(files[0].name);
      setIsFilePicked(true);
    }
  };

  const onUploadFileClick = async () => {
    if (!selectedFile) {
      alert("file not selected.");
      return;
    }

    const uploadFormData = new FormData();

    uploadFormData.append("filename", fileName);
    uploadFormData.append("file", selectedFile);

    await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/file/upload`,
      {
        method: "POST",
        body: uploadFormData
      }
    );
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
      <input value={fileName} onChange={e => setFileName(e.target.value)} />
      <button onClick={onUploadFileClick} disabled={!isFilePicked || fileName == ''}>
        Upload
      </button>
    </div>
  );
};
