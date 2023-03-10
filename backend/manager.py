import data_store as ds
import s3
import mongo
from classes import DBSong, Song

SHOULD_PRIVATISE_PAST_SONGS = True

def get_song_list():
  return mongo.get_songs()

def get_song_link():
  song = ds.get_current_song()
  if song is None:
    return False
  return s3.get_song_link(song.filename)

def get_current_song():
  return ds.get_current_song()

def update_song(forward=True):
  old_song = get_current_song()
  if old_song is not None:
    if forward:
      ds.add_song_to_history(old_song)
    else:
      ds.rollback_song_to_queue(old_song)
    if SHOULD_PRIVATISE_PAST_SONGS or not forward:
      s3.make_private(old_song.filename)

  if forward:
    next_current_song = ds.pop_song_from_queue()
  else:
    next_current_song = ds.rollback_song_from_history()
  if next_current_song is None:
    ds.clear_current_song()
  else:
    ds.set_current_song(next_current_song)
    s3.make_public(next_current_song.filename)
  return next_current_song

def get_songs_queue():
  return ds.get_song_queue()

def get_songs_history():
  return ds.get_song_history()

async def upload_song(song_id: str, file: bytes, extension: str):
  song = mongo.get_song(song_id)
  filename = await s3.upload_file(song_id, file, extension)
  if filename:
    ds.add_song_to_queue(Song(filename=filename, id=song_id, name=song.name, artist=song.artist))

async def upload_song_new(song_name: str, artist: str, file: bytes, extension: str):
  song_id = mongo.add_song(DBSong(name=song_name, artist=artist))
  filename = await s3.upload_file(song_id, file, extension)
  if filename:
    ds.add_song_to_queue(Song(filename=filename, id=song_id, name=song_name, artist=artist))
