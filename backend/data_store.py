import json
import os
from urllib.parse import urlparse
import redis
from exception import ItemNotFoundException

from dotenv import load_dotenv
load_dotenv()

url = urlparse(os.environ.get('REDISCLOUD_URL'))
r = redis.Redis(host=url.hostname, port=url.port, password=url.password)

K_CURRENT_SONG = 'current_song'
K_QUEUE = 'queue'
K_HISTORY = 'history'

class Song:
  def __init__(self, filename, name, artist):
    self.filename = filename
    self.name = name
    self.artist = artist

  def to_json(self):
    return json.dumps({
      'filename': self.filename,
      'name': self.name,
      'artist': self.artist,
    })

  @staticmethod
  def from_json(j):
    if j is None:
      raise ItemNotFoundException()
    o = json.loads(j)
    return Song(o['filename'], o['name'], o['artist'])

  def __str__(self) -> str:
    return f"Song({self.filename}, {self.name} - {self.artist})"


def set_current_song(song: Song):
  r.set(K_CURRENT_SONG, song.to_json())

def get_current_song() -> Song:
  s = r.get(K_CURRENT_SONG)
  if s is None:
    return s
  else:
    return Song.from_json(s)

def clear_current_song():
  r.delete(K_CURRENT_SONG)

def add_song_to_queue(song: Song):
  if song is None:
    raise Exception('song is None')
  r.rpush(K_QUEUE, song.to_json())

def pop_song_from_queue():
  s = r.lpop(K_QUEUE)
  if s is None:
    return s
  else:
    return Song.from_json(s)

def get_song_queue():
  return list(map(lambda j: Song.from_json(j), r.lrange(K_QUEUE, 0, -1)))

def add_song_to_history(song: Song):
  if song is None:
    return
  r.lpush(K_HISTORY, song.to_json())

def get_song_history():
  return list(map(lambda j: Song.from_json(j), r.lrange(K_HISTORY, 0, -1)))

def _clear_queue():
  r.delete(K_QUEUE)

def _clear_history():
  r.delete(K_HISTORY)
