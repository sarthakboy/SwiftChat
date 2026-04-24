from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from passlib.context import CryptContext
import httpx
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load optional local env files in order of precedence
load_dotenv(".env")
load_dotenv(".secret")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Validate required environment variables
if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL environment variable not set")
if not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_KEY environment variable not set")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable not set")

# Build headers only if we have the key
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

@router.post("/register")
async def register(user: UserRegister):
    hashed_password = pwd_context.hash(user.password)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/users",
            headers=HEADERS,
            json={
                "username": user.username,
                "email": user.email,
                "password": hashed_password
            }
        )
        if response.status_code not in (200, 201):
            raise HTTPException(status_code=400, detail=response.text)
        return {"message": "User registered successfully"}

class UserLogin(BaseModel):
    email: str
    password: str

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login")
async def login(user: UserLogin, response: Response):
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{SUPABASE_URL}/rest/v1/users?email=eq.{user.email}",
            headers=HEADERS
        )
        data = res.json()
        if not data:
            raise HTTPException(status_code=404, detail="User not found")

        db_user = data[0]
        if not pwd_context.verify(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token({"sub": db_user["username"]})
        print("Generated JWT token:", token)

        # Set JWT as cookie
        response.set_cookie(
            key="jwt",
            value=token,
            httponly=True,
            samesite="None",
            secure=False,   # set True in production (Render)
            path="/"
        )

        # Return token and username
        return {
            "access_token": token,
            "token_type": "bearer",
            "username": db_user["username"]   # <-- add this line
        }