import json
from pydantic import BaseModel
from pydantic.tools import parse_obj_as

def from_json(T, j):
  return parse_obj_as(T, json.loads(j))

class DBSong(BaseModel):
  name: str
  artist: str

class DBSongID(DBSong):
  id: str

class Song(DBSongID):
  filename: str

class User(BaseModel):
  username: str
  password: str
  priv: int

  def __str__(self) -> str:
    return f"User({self.username}, privileges: {self.priv})"


class NewUser(BaseModel):
  username: str
  password: str
  priv: int
  masterPassword: str
