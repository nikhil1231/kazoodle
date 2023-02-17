import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import logging
import uuid

BUCKET_NAME = 'kazoodle-main'

s3_config = Config(
    region_name = 'eu-west-2',
    signature_version = 'v4',
    retries = {
        'max_attempts': 3,
        'mode': 'standard'
    }
)
s3_client = boto3.client('s3', config=s3_config)

async def upload_file(song_name: str, artist: str, file: bytes, extension: str):
  filename = str(uuid.uuid4())[:8] + extension
  try:
    response = s3_client.upload_fileobj(file, BUCKET_NAME, filename, ExtraArgs={
      'Metadata': {
        'song_name': song_name,
        'artist': artist
      }
    })
  except ClientError as e:
    logging.error(e)
    return False
  return filename

def make_public(key: str):
  _setACL(key, 'public-read')

def make_private(key: str):
  _setACL(key, 'private')

def _setACL(key: str, acl: str):
  s3_client.put_object_acl(Bucket=BUCKET_NAME, Key=key, ACL=acl)
