from io import BytesIO
import os
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, Form, UploadFile, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from classes import NewUser, User
from utils import get_env_var
import manager
from scheduler import get_next_song_time, start_update_timer
import auth

app = FastAPI()

oauth2_scheme = auth.OAuth2PasswordBearerCookie(tokenUrl="token")

# Daily timer to update the song
start_update_timer()

### CORS ###
origins = [get_env_var('FRONTEND_URL')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/song/list")
async def get_song_list_():
  return {"songs": manager.get_song_list()}

@app.get("/song/link")
async def get_song_link_():
  return {"url": manager.get_song_link()}

@app.get("/song/current")
async def get_current_song_():
  return manager.get_current_song()

@app.get("/song/time_til_next")
async def get_next_time_():
  return {"seconds_til_next": get_next_song_time()}

@app.get("/song/history")
async def get_song_history_():
  return {'history': manager.get_songs_history()}

###################### PROTECTED ######################

async def get_current_user(token: str = Depends(oauth2_scheme)):
  credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
  )

  user = await auth.get_current_user(token)

  if not user:
    raise credentials_exception

  return user

@app.get("/song/queue")
async def get_song_queue_(user: User = Depends(get_current_user)):
  assertAdmin(user)
  return {'queue': manager.get_songs_queue()}

@app.post("/song/upload")
async def create_upload_file(song_id: str = Form(),
                             file: UploadFile = File(...),
                             user: User = Depends(get_current_user)):
  assertAdmin(user)
  _, ext = os.path.splitext(file.filename)
  await manager.upload_song(song_id, BytesIO(await file.read()), ext)
  return {"song_id": song_id}

@app.post("/song/upload/new")
async def create_upload_file_new(song_name: str = Form(),
                                 artist: str = Form(),
                                 file: UploadFile = File(...),
                                 user: User = Depends(get_current_user)):
  assertAdmin(user)
  _, ext = os.path.splitext(file.filename)
  await manager.upload_song_new(song_name, artist, BytesIO(await file.read()), ext)
  return {"song_name": song_name}

@app.post("/song/next")
async def next_song_(user: User = Depends(get_current_user)):
  assertAdmin(user)
  return {
    'current_song': manager.update_song()
  }

@app.post("/song/previous")
async def prev_song_(user: User = Depends(get_current_user)):
  assertAdmin(user)
  return {
    'current_song': manager.update_song(forward=False)
  }


@app.post("/user/token")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
  token = auth.login(form_data.username, form_data.password)
  if not token:
    raise HTTPException(status_code=400, detail="Incorrect username or password")
  response.set_cookie('Authorization',
                      f"bearer {token['access_token']}",
                      expires=token['expiry'].timestamp())
  return token

@app.get("/user/me")
async def get_user_(user: User = Depends(get_current_user)):
  return user.dict(exclude={'password'})

@app.post("/user/new")
async def new_user_(new_user: NewUser):
  username = auth.new_user(**new_user.dict())
  if not username:
    raise HTTPException(status_code=401, detail="Error creating user")
  return {"created_user": username}

def assertAdmin(user: User):
  if user.priv < auth.PRIV_ADMIN:
    raise HTTPException(401, "Unauthorized")
