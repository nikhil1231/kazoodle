from datetime import timedelta, datetime
from typing import Optional

from fastapi import HTTPException, Request
import utils
from jose import JWTError, jwt
from classes import User
import data_store as ds
from passlib.context import CryptContext
from fastapi.security import OAuth2
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.security.utils import get_authorization_scheme_param

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30
SECRET_KEY = utils.get_env_var('JWT_TOKEN_SECRET_KEY')

PRIV_USER = 0
PRIV_ADMIN = 1

def new_user(username: str, password: str, priv: int, masterPassword: str) -> User | None:
  if masterPassword != utils.get_env_var("USER_CREATION_MASTER_PASSWORD"):
    return None
  hashed_password = _hash_password(password)
  u = User(username=username, password=hashed_password, priv=priv)
  res = ds.new_user(u)
  if res:
    return u.username
  else:
    return None

def login(username: str, password: str):
  user = authenticate_user(username, password)
  if not user:
    return False

  return create_access_token(data={"sub": user.username})

def authenticate_user(username: str, password: str):
  user = get_user(username)
  if not user:
    return False
  if not check_password(password, user.password):
    return False
  return user

def get_user(username: str) -> User | None:
  return ds.get_user(username)

def get_users() -> User | None:
  return ds._get_users()

def check_password(plain_password: str, hashed_password: str) -> bool:
  return pwd_context.verify(plain_password, hashed_password)

def _hash_password(password: str) -> str:
  return pwd_context.hash(password)

async def get_current_user(token: str):
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    username: str = payload.get("sub")
    if username is None:
      return None
  except JWTError:
    return None
  user = get_user(username)
  if user is None:
    return None
  return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
  to_encode = data.copy()
  if expires_delta:
    expire = datetime.utcnow() + expires_delta
  else:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return {"access_token": encoded_jwt, "token_type": "bearer", "expiry": datetime.astimezone(expire)}

class OAuth2PasswordBearerCookie(OAuth2):
  def __init__(
    self,
    tokenUrl: str,
    scheme_name: str = None,
    scopes: dict = None,
    auto_error: bool = True,
  ):
    if not scopes:
        scopes = {}
    flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": scopes})
    super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)

  async def __call__(self, request: Request) -> Optional[str]:
    header_authorization: str = request.headers.get("Authorization")
    cookie_authorization: str = request.cookies.get("Authorization")

    header_scheme, header_param = get_authorization_scheme_param(
      header_authorization
    )
    cookie_scheme, cookie_param = get_authorization_scheme_param(
      cookie_authorization
    )

    if header_scheme.lower() == "bearer":
      authorization = True
      scheme = header_scheme
      param = header_param
    elif cookie_scheme.lower() == "bearer":
      authorization = True
      scheme = cookie_scheme
      param = cookie_param
    else:
      authorization = False

    if not authorization or scheme.lower() != "bearer":
      if self.auto_error:
        raise HTTPException(
          status_code=403, detail="Not authenticated"
        )
      else:
        return None
    return param
