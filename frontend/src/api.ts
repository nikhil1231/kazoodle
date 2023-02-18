export const getSongLink = async (): Promise<string> => {
  const res = await get("/song/upload");
  return res.url;
};

export const getCurrentSong = async (): Promise<Song> => {
  const res = await get("/song/current");
  return res;
};

export const getTimeTilNextSong = async (): Promise<number> => {
  const res = await get("/song/time_til_next");
  return res.seconds_til_next;
};

export const getSongHistory = async (): Promise<Song[]> => {
  const res = await get("/song/history");
  return res.history;
};

export const getSongQueue = async (): Promise<Song[]> => {
  const res = await get("/song/queue");
  return res.queue;
};

export const uploadSong = async (formData: FormData): Promise<void> => {
  const res = await post("/song/upload", formData);
};

export const getUserResponse = async (): Promise<Response> => {
  return await _get("/user/me");
};

export const postLogin = async (formData: FormData): Promise<Response> => {
  return await _post("/user/token", formData);
};

const get = async (path: string) => {
  const res = await _get(path);
  return await res.json();
};

const post = async (path: string, body?: object) => {
  const res = await _post(path, body);
  return await res.json();
};

const _get = async (path: string) => {
  return await fetch(`${process.env.REACT_APP_BACKEND_URL}${path}`, {
    method: "GET",
    credentials: "include",
  });
};

const _post = async (path: string, body?: object) => {
  return await fetch(`${process.env.REACT_APP_BACKEND_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: body as BodyInit,
  });
};
