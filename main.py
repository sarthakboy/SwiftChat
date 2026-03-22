from fastapi import FastAPI
from fastapi import HTTPException
from pydantic import BaseModel

# Create a FastAPI instance
app = FastAPI()

# Local in-memory database
users = {
    1: {"name": "Raj", "email": "raj@gmail.com", "status": "online"},
    2: {"name": "Priya", "email": "priya@gmail.com", "status": "offline"}
}

# Define the UserCreate model
class UserCreate(BaseModel):
    name: str
    email: str
# Define a path operation decorator
@app.get("/")
def read_root():
    return {"message": "Welcome to SwiftChat", "status": "running"}

@app.get("/users/{user_id}")
def read_user(user_id: int):
    user = users.get(user_id)
    if user:
        return user
    return{"error": "User not found"}

@app.post("/users")
def create_user(user: UserCreate):
    for existing in users.values():
        if existing["email"] == user.email:
            raise HTTPException(status_code=400, detail="User already exists")
    new_id = max(users.keys()) + 1 if users else 1
    users[new_id] = {"name": user.name, "email": user.email, "status": "online"}
    return users[new_id]

@app.put("/users/update/{user_id}")
def update_user(user_id: int, name: str = None, email: str = None, status: str = None):
    user = users.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if name:
        user["name"] = name
    if email:
        user["email"] = email
    if status:
        user["status"] = status
    return user
@app.delete("/users/delete/{user_id}")
def delete_user(user_id: int):
    if user_id in users:
        del users[user_id]
        return {"message": "User deleted"}
    raise HTTPException(status_code=404, detail="User not found")

