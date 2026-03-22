from passlib.context import CryptContext
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)

def create_token(data: dict, secret_key: str, algorithm: str = "HS256"):
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    payload["exp"] = expire
    return jwt.encode(payload, secret_key, algorithm=algorithm)

def verify_token(token: str, secret_key: str, algorithms: list = ["HS256"]):
    try:
        payload = jwt.decode(token, secret_key, algorithms=algorithms)
        return payload
    except ExpiredSignatureError:
        raise ValueError("Token has expired")
    except JWTError:
        raise ValueError("Invalid token")
    
SECRET_KEY = "swiftchat-secret-2026"

token = create_token({"username": "sarthak"}, SECRET_KEY)
print("Token:", token)

payload = verify_token(token, SECRET_KEY)
print("Payload:", payload)