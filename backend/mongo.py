from typing import List
from bson import ObjectId
import pymongo
from classes import DBSong, DBSongID
import utils

MONGO_DB_NAME = 'kazoodle'
MONGO_SONG_COLLECTION_NAME = 'songs'

client = pymongo.MongoClient(utils.get_env_var("MONGO_URL"))

song_collection = client[MONGO_DB_NAME][MONGO_SONG_COLLECTION_NAME]

def get_song(id: str) -> DBSongID:
  s = song_collection.find_one({
    "_id": ObjectId(id)
  })
  return DBSongID(name=s['name'], artist=s['artist'], id=id)

def get_songs() -> List[DBSongID]:
  return list(map(lambda s: DBSongID(name=s['name'], artist=s['artist'], id=str(s['_id'])), song_collection.find()))

def add_song(song: DBSong) -> str:
  res = song_collection.insert_one(song.dict())
  return str(res.inserted_id)

def add_songs(songs: List[DBSong]):
  song_collection.insert_many(map(lambda s: s.dict(), songs))
