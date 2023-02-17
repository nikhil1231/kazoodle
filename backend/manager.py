import os
from data_store import Song, add_song_to_queue, add_song_to_history, clear_current_song, get_current_song, get_song_history, get_song_queue, pop_song_from_queue, set_current_song
import s3

SHOULD_PRIVATISE_PAST_SONGS = True

def get_song_link():
  song = get_current_song()
  if song is None:
    return False
  return f"{os.environ.get('S3_BUCKET_URL')}/{song.filename}"

def update_song():
  old_song = get_current_song()
  if old_song is not None:
    add_song_to_history(old_song)
    if SHOULD_PRIVATISE_PAST_SONGS:
      s3.make_private(old_song.filename)

  new_song = pop_song_from_queue()
  if new_song is None:
    clear_current_song()
  else:
    set_current_song(new_song)
    s3.make_public(new_song.filename)
  return new_song

def get_songs_queue():
  return get_song_queue()

def get_songs_history():
  return get_song_history()

async def upload_song(song_name: str, artist: str, file: bytes, extension: str):
  filename = await s3.upload_file(song_name, artist, file, extension)
  if filename:
    add_song_to_queue(Song(filename, song_name, artist))
