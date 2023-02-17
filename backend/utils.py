from dotenv import load_dotenv
load_dotenv()

import os

from exception import EnvVarNotSetException

def get_env_var(k):
  v = os.environ.get(k)
  if v is None:
    raise EnvVarNotSetException(f"Environment variable '{k}' not set")
  return v

def is_prod():
  return os.environ.get('PROD') == 'true'
