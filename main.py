from datetime import datetime
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import httpx
import auth
from auth import SECRET_KEY, ALGORITHM, SUPABASE_KEY, SUPABASE_URL, HEADERS, router
from jose import jwt, JWTError
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# include register/login routes
app.include_router(router)

# serve static files (frontend)



# -------------------------------
# Connection Manager
# -------------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections = {}  # {room_id: [websockets]}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        self.active_connections.setdefault(room_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)

    async def broadcast(self, message: str, room_id: str):
        if room_id in self.active_connections:
            # Create a copy of the list to iterate safely
            for ws in self.active_connections[room_id][:]:
                try:
                    await ws.send_text(message)
                except Exception:
                    # If sending fails, the connection is likely dead
                    self.disconnect(ws, room_id)

manager = ConnectionManager()

# -------------------------------
# Room Endpoints
# -------------------------------
@app.post("/create_room/{room_id}")
async def create_room(room_id: str, username: str):
    if len(room_id) != 5 or not room_id.isalnum():
        raise HTTPException(status_code=400, detail="Room ID must be 5 alphanumeric characters")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/rooms?room_id=eq.{room_id}",
            headers=HEADERS
        )
        if response.json():
            raise HTTPException(status_code=400, detail="Room ID already taken")

        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/rooms",
            headers=HEADERS,
            json={"room_id": room_id, "created_by": username}
        )
        if response.status_code not in (200, 201):
            raise HTTPException(status_code=400, detail=response.text)

    return {"room_id": room_id, "message": "Room created successfully"}

@app.get("/rooms/{room_id}")
async def check_room(room_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/rooms?room_id=eq.{room_id}",
            headers=HEADERS
        )
        return response.json()

@app.get("/messages/{room_id}")
async def get_messages(room_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SUPABASE_URL}/rest/v1/message?room_id=eq.{room_id}&order=created_at.asc",
            headers=HEADERS
        )
        return response.json()

# -------------------------------
# WebSocket Chat
# -------------------------------
@app.websocket("/chat/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    # 1. Extract and Validate Token
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
    except JWTError:
        await websocket.close(code=1008)
        return

    # 2. Register the connection in the Manager
    await manager.connect(websocket, room_id)
    
    try:
        while True:
            # Receive message from the user
            data = await websocket.receive_text()
            
            # 3. Persistence: Save to Supabase (PostgreSQL)
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{SUPABASE_URL}/rest/v1/message",
                    headers=HEADERS,
                    json={
                        "sender": username,
                        "content": data,
                        "created_at": datetime.utcnow().isoformat(),
                        "room_id": room_id
                    }
                )

            # 4. Real-time: Broadcast to everyone in the room
            # Format as a string or JSON so the frontend can parse it
            # Instead of f"{username}: {data}"
                await manager.broadcast(json.dumps({"sender": username, "content": data}), room_id)

    except WebSocketDisconnect:
        # 5. Cleanup on disconnect
        manager.disconnect(websocket, room_id)
        print(f"🔌 {username} left room {room_id}")        
        
app.mount("/static", StaticFiles(directory="chat-frontend/build/static"), name="static")
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Avoid interfering with API endpoints (if they aren't prefixed)
    # if full_path.startswith("api/"): ... 
    return FileResponse("chat-frontend/build/index.html")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)