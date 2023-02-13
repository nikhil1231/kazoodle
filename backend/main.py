import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, Form, UploadFile

from file import upload_file

app = FastAPI()

load_dotenv()

origins = [os.environ.get('FRONTEND_URL')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/file/upload")
async def create_upload_file(filename: str = Form(), file: UploadFile = File(...)):
  await upload_file(filename, file)
  return {"filename": filename}
