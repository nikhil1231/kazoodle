import json
import os
from urllib.parse import urlparse
import redis
from dotenv import load_dotenv
load_dotenv()

url = urlparse(os.environ.get('REDISCLOUD_URL'))
r = redis.Redis(host=url.hostname, port=url.port, password=url.password)

K_CURRENT_SONG = 'current_song'
K_QUEUE = 'queue'
K_HISTORY = 'history'

class Song:
  def __init__(self, id, name, artist):
    self.id = id
    self.name = name
    self.artist = artist

  def to_json(self):
    return json.dumps({
      'id': self.id,
      'name': self.name,
      'artist': self.artist,
    })

  @staticmethod
  def from_json(j):
    o = json.loads(j)
    return Song(o['id'], o['name'], o['artist'])

  def __str__(self) -> str:
    return f"Song({self.id}, {self.name} - {self.artist})"


def set_current_song(song: Song):
  r.set(K_CURRENT_SONG, song.to_json())

def get_current_song():
  return Song.from_json(r.get(K_CURRENT_SONG))

def add_new_song(song: Song):
  r.rpush(K_QUEUE, song.to_json())

def pop_song():
  return Song.from_json(r.lpop(K_QUEUE))

def get_song_queue():
  return list(map(lambda j: Song.from_json(j), r.lrange(K_QUEUE, 0, -1)))

def archive_song(song: Song):
  r.lpush(K_HISTORY, song.to_json())

def get_song_history():
  return list(map(lambda j: Song.from_json(j), r.lrange(K_HISTORY, 0, -1)))

def _clear_queue():
  r.delete(K_QUEUE)

def _clear_history():
  r.delete(K_HISTORY)
