import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import logging
import uuid
from fastapi import UploadFile
from io import BytesIO

BUCKET_NAME = 'kazoodle-main'

s3_config = Config(
    region_name = 'eu-west-2',
    signature_version = 'v4',
    retries = {
        'max_attempts': 3,
        'mode': 'standard'
    }
)

async def upload_file(filename: str, file: UploadFile):
  s3_client = boto3.client('s3', config=s3_config)
  file_bytes = BytesIO(await file.read())
  try:
    response = s3_client.upload_fileobj(file_bytes, BUCKET_NAME, str(uuid.uuid4())[:8], ExtraArgs={
      'Metadata': {
        'name': filename
      }
    })
  except ClientError as e:
    logging.error(e)
    return False
  return True
