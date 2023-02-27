import { getAccessToken } from "./utils";

export const getSongLink = async (): Promise<string> => {
  const res = await get("/song/link");
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
  const res = await get("/song/queue", true);
  return res.queue;
};

export const uploadSong = async (formData: FormData): Promise<void> => {
  const res = await post("/song/upload", formData, true);
};

export const getUserResponse = async (): Promise<Response> => {
  return await _get("/user/me", true);
};

export const postLogin = async (formData: FormData): Promise<Response> => {
  return await _post("/user/token", formData);
};

const get = async (path: string, auth: boolean = false) => {
  const res = await _get(path, auth);
  return await res.json();
};

const post = async (path: string, body?: object, auth: boolean = false) => {
  const res = await _post(path, body, auth);
  return await res.json();
};

const _get = async (path: string, auth: boolean = false) => {
  return await fetch(`${process.env.REACT_APP_BACKEND_URL}${path}`, {
    method: "GET",
    headers: auth ? _get_headers() : {},
    credentials: "include",
  });
};

const _post = async (path: string, body?: object, auth: boolean = false) => {
  return await fetch(`${process.env.REACT_APP_BACKEND_URL}${path}`, {
    method: "POST",
    headers: auth ? _get_headers() : {},
    credentials: "include",
    body: body as BodyInit,
  });
};

const _get_headers = () => {
  return {
    'Authorization': `Bearer ${getAccessToken()}`
  };
};
