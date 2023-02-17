from urllib.parse import urlparse
import redis
from classes import Song, User, from_json
from utils import get_env_var, is_prod

from dotenv import load_dotenv
load_dotenv()

url = urlparse(get_env_var('REDISCLOUD_URL'))
r = redis.Redis(host=url.hostname, port=url.port, password=url.password)

_prod_suffix = lambda: ":PROD" if is_prod() else ""

K_CURRENT_SONG = 'current_song' + _prod_suffix()
K_QUEUE = 'queue' + _prod_suffix()
K_HISTORY = 'history' + _prod_suffix()

K_USERS = 'users' + _prod_suffix()

###################### SONGS ######################

def set_current_song(song: Song):
  r.set(K_CURRENT_SONG, song.json())

def get_current_song() -> Song:
  s = r.get(K_CURRENT_SONG)
  if s is None:
    return s
  else:
    return from_json(Song, s)

def clear_current_song():
  r.delete(K_CURRENT_SONG)

def add_song_to_queue(song: Song):
  if song is None:
    raise Exception('song is None')
  r.rpush(K_QUEUE, song.json())

def rollback_song_to_queue(song: Song):
  if song is None:
    raise Exception('song is None')
  r.lpush(K_QUEUE, song.json())

def pop_song_from_queue():
  s = r.lpop(K_QUEUE)
  if s is None:
    return s
  else:
    return from_json(Song, s)

def get_song_queue():
  return _get_list(Song, K_QUEUE)

def add_song_to_history(song: Song):
  if song is None:
    return
  r.lpush(K_HISTORY, song.json())

def rollback_song_from_history():
  s = r.lpop(K_HISTORY)
  if s is None:
    return s
  else:
    return from_json(Song, s)

def get_song_history():
  return _get_list(Song, K_HISTORY)


###################### USERS ######################

def new_user(user: User) -> bool:
  if user is None:
    raise Exception('user is None')

  users = _get_users()
  if user.username in map(lambda u: u.username, users):
    return False

  r.rpush(K_USERS, user.json())
  return True

def get_user(username: str) -> User | None:
  users = _get_users()

  for user in users:
    if user.username == username:
      return user

  return None


def _get_users():
  return _get_list(User, K_USERS)

def _clear_users():
  r.delete(K_USERS)

###################### COMMON ######################

def _get_list(type, key):
  return list(map(lambda j: from_json(type, j), r.lrange(key, 0, -1)))

###################### !!! DANGER ZONE !!! ######################

def _clear_queue():
  r.delete(K_QUEUE)

def _clear_history():
  r.delete(K_HISTORY)

def _clear_all():
  clear_current_song()
  _clear_queue()
  _clear_history()
