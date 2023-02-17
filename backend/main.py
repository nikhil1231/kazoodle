from io import BytesIO
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, Form, UploadFile
from utils import get_env_var
from manager import get_song_link, get_songs_history, get_songs_queue, update_song, upload_song
from scheduler import start_update_timer

app = FastAPI()


start_update_timer()

origins = [get_env_var('FRONTEND_URL')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/song/link")
async def get_song_link_():
  return {"url": get_song_link()}

@app.get("/song/history")
async def get_song_history_():
  return {'history': get_songs_history()}

###################### PROTECTED ######################

@app.get("/song/queue")
async def get_song_queue_():
  return {'queue': get_songs_queue()}

@app.post("/song/upload")
async def create_upload_file(song_name: str = Form(), artist: str = Form(), file: UploadFile = File(...)):
  _, ext = os.path.splitext(file.filename)
  await upload_song(song_name, artist, BytesIO(await file.read()), ext)
  return {"song_name": song_name}


###################### TESTING PURPOSES ######################

@app.post("/song/next")
async def next_song_():
  return {
    'new_song': update_song()
  }
