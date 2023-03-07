import json
from classes import DBSong
import mongo

def upload_songs(filename):
  with open(filename, 'r') as f:
    data = json.load(f)

  upload_data = []

  for artist_data in data['o']:
    artist = artist_data['artist']
    for song_data in artist_data['songs']:
      upload_data.append(DBSong(artist=artist, name=song_data['name']))

  mongo.add_songs(upload_data)

if __name__ == "__main__":
  upload_songs('./backend/heardleSongs.json')