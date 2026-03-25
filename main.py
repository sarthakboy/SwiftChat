from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from database import SUPABASE_URL, HEADERS

# Create a FastAPI instance
app = FastAPI()

# Define the UserCreate model
class UserCreate(BaseModel):
    name: str
    email: str

@app.get("/")
def read_root():
    return {"message": "Welcome to SwiftChat", "status": "running"}

@app.get("/users")
async def read_users():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SUPABASE_URL}/rest/v1/testemployee", headers=HEADERS)
        return response.json()

@app.get("/users/{user_id}")
async def read_user(user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/testemployee?id=eq.{user_id}",
            headers=HEADERS
        )
        data = response.json()
        if data:
            return data[0]
        raise HTTPException(status_code=404, detail="User not found")

@app.post("/users")
async def create_user(user: UserCreate):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/testemployee",
            headers=HEADERS,
            json={"name": user.name, "email": user.email, "status": "online"}
        )
        return response.json()

@app.put("/users/update/{user_id}")
async def update_user(user_id: int, name: str = None, email: str = None, status: str = None):
    update_data = {}
    if name: update_data["name"] = name
    if email: update_data["email"] = email
    if status: update_data["status"] = status

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"{SUPABASE_URL}/rest/v1/testemployee?id=eq.{user_id}",
            headers=HEADERS,
            json=update_data
        )
        data = response.json()
        if data:
            return data[0]
        raise HTTPException(status_code=404, detail="User not found")

@app.delete("/users/delete/{user_id}")
async def delete_user(user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{SUPABASE_URL}/rest/v1/testemployee?id=eq.{user_id}",
            headers=HEADERS
        )
        if response.status_code == 204:
            return {"message": "User deleted"}
        raise HTTPException(status_code=404, detail="User not found")