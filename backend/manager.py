from data_store import Song, add_song_to_queue, add_song_to_history, clear_current_song, get_current_song, get_song_history, get_song_queue, pop_song_from_queue, rollback_song_from_history, rollback_song_to_queue, set_current_song
import s3

SHOULD_PRIVATISE_PAST_SONGS = True

def get_song_link():
  song = get_current_song()
  if song is None:
    return False
  return s3.get_song_link(song.filename)

def update_song(forward=True):
  old_song = get_current_song()
  if old_song is not None:
    if forward:
      add_song_to_history(old_song)
    else:
      rollback_song_to_queue(old_song)
    if SHOULD_PRIVATISE_PAST_SONGS or not forward:
      s3.make_private(old_song.filename)

  if forward:
    next_current_song = pop_song_from_queue()
  else:
    next_current_song = rollback_song_from_history()
  if next_current_song is None:
    clear_current_song()
  else:
    set_current_song(next_current_song)
    s3.make_public(next_current_song.filename)
  return next_current_song

def get_songs_queue():
  return get_song_queue()

def get_songs_history():
  return get_song_history()

async def upload_song(song_name: str, artist: str, file: bytes, extension: str):
  filename = await s3.upload_file(song_name, artist, file, extension)
  if filename:
    add_song_to_queue(Song(filename, song_name, artist))
