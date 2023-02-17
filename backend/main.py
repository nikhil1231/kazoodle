from io import BytesIO
import os
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, Form, UploadFile, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from classes import NewUser, User
from utils import get_env_var
from manager import get_current_song, get_song_link, get_songs_history, get_songs_queue, update_song, upload_song
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

@app.get("/song/link")
async def get_song_link_():
  return {"url": get_song_link()}

@app.get("/song/current")
async def get_current_song_():
  return get_current_song()

@app.get("/song/time_til_next")
async def get_next_time_():
  return {"seconds_til_next": get_next_song_time()}

@app.get("/song/history")
async def get_song_history_():
  return {'history': get_songs_history()}

###################### PROTECTED ######################

def get_current_user(token: str = Depends(oauth2_scheme)):
  credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
  )

  user = auth.get_current_user(token)

  if not user:
    raise credentials_exception

  return user

@app.get("/song/queue")
async def get_song_queue_(user: User = Depends(get_current_user)):
  await assertAdmin(user)
  return {'queue': get_songs_queue()}

@app.post("/song/upload")
async def create_upload_file(song_name: str = Form(),
                             artist: str = Form(),
                             file: UploadFile = File(...),
                             user: User = Depends(get_current_user)):
  await assertAdmin(user)
  _, ext = os.path.splitext(file.filename)
  await upload_song(song_name, artist, BytesIO(await file.read()), ext)
  return {"song_name": song_name}

@app.post("/song/next")
async def next_song_(user: User = Depends(get_current_user)):
  await assertAdmin(user)
  return {
    'current_song': update_song()
  }

@app.post("/song/previous")
async def prev_song_(user: User = Depends(get_current_user)):
  await assertAdmin(user)
  return {
    'current_song': update_song(forward=False)
  }


@app.post("/user/token")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
  token = auth.login(form_data.username, form_data.password)
  if not token:
    raise HTTPException(status_code=400, detail="Incorrect username or password")
  response.set_cookie('Authorization',
                      f"bearer {token['access_token']}",
                      expires=token['expiry'])
  return token

@app.get("/user/me")
async def get_user_(user: User = Depends(get_current_user)):
  return (await user).dict(exclude={'password'})

@app.post("/user/new")
async def new_user_(new_user: NewUser):
  username = auth.new_user(**new_user.dict())
  if not username:
    raise HTTPException(status_code=401, detail="Error creating user")
  return {"created_user": username}

async def assertAdmin(user: User):
  if (await user).priv < auth.PRIV_ADMIN:
    raise HTTPException(401, "Unauthorized")
