import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import logging
import uuid
from utils import is_prod

REGION_NAME = 'eu-west-2'
BUCKET_NAME = f'kazoodle-{"main" if is_prod() else "dev"}'
BUCKET_URL = f'https://{BUCKET_NAME}.s3.{REGION_NAME}.amazonaws.com'

s3_config = Config(
    region_name = REGION_NAME,
    signature_version = 'v4',
    retries = {
        'max_attempts': 3,
        'mode': 'standard'
    }
)
s3_client = boto3.client('s3', config=s3_config)

async def upload_file(song_id: str, file: bytes, extension: str):
  filename = str(uuid.uuid4())[:8] + extension
  try:
    response = s3_client.upload_fileobj(file, BUCKET_NAME, filename, ExtraArgs={
      'Metadata': {
        'song_id': song_id,
      }
    })
  except ClientError as e:
    logging.error(e)
    return False
  return filename

def get_song_link(filename: str):
  return f"{BUCKET_URL}/{filename}"

def make_public(key: str):
  _setACL(key, 'public-read')

def make_private(key: str):
  _setACL(key, 'private')

def _setACL(key: str, acl: str):
  s3_client.put_object_acl(Bucket=BUCKET_NAME, Key=key, ACL=acl)
