from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import httpx
import auth
from auth import SECRET_KEY, ALGORITHM, SUPABASE_KEY, SUPABASE_URL, HEADERS, router
from jose import jwt, JWTError
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.mount("/", StaticFiles(directory="chat-frontend/build", html=True), name="frontend")
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_path = os.path.join("chat-frontend", "build", "index.html")
    return FileResponse(index_path)

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


@app.get("/")
async def root():
    return FileResponse("static/index.html")
@app.get("/room_login.html")
async def room_login():
    return FileResponse("static/room_login.html")
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
        for ws in self.active_connections.get(room_id, []):
            await ws.send_text(message)

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
    await websocket.accept()

    # ✅ Read token from query parameter instead of cookies
    token = websocket.query_params.get("token")
    print("WebSocket token received:", token)

    if not token:
        print("❌ No JWT token provided in query params")
        await websocket.close(code=1008)
        return

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        print("✅ JWT decoded successfully, user:", username)
    except JWTError as e:
        print("❌ JWT decode failed:", str(e))
        await websocket.close(code=1008)
        return

    try:
        while True:
            data = await websocket.receive_text()
            print(f"📩 Message from {username} in room {room_id}: {data}")
            # ✅ Save message into PostgreSQL (Supabase REST API example)
            async with httpx.AsyncClient() as client:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{SUPABASE_URL}/rest/v1/message",
                        headers={
                            "apikey": SUPABASE_KEY,  # backend should use service_role
                            "Authorization": f"Bearer {SUPABASE_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "sender": username,                     # from JWT payload
                            "content": data,                        # the chat text
                            "created_at": datetime.utcnow().isoformat(),  # timestamp
                            "room_id": room_id                    # must match your rooms table
                        }
                    )
                    print("DB insert response:", response.status_code, response.text)

            # Broadcast or save message logic goes here
            await websocket.send_text(f"{username}: {data}")
    except WebSocketDisconnect:
        print(f"🔌 {username} disconnected from room {room_id}")
        await websocket.close() 
        
        
