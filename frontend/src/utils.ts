export const getAccessToken = (): string => {
  return localStorage.getItem("token") || "";
};

export const saveAccessToken = (token: AccessToken): void => {
  localStorage.setItem("token", token.access_token);
};
