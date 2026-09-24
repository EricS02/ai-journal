from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request

import storage
import datetime

from main import process_entry, create_goal



app = FastAPI()

origins = [
    "http://localhost:5173"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/api/ping")
def read_rout():
    return {"message": "Cors-enabled api is working"}

@app.get("/api/state")
def get_state():
    journal = storage.load()
    return {
        "goals": journal["goals"],
        "entries": journal["entries"],
        "concepts": journal["concepts"],
        "today": datetime.date.today().isoformat()
    }

@app.post("/api/entries")
async def create_entry(request: Request):
    journal = storage.load()
    try:
        body = await request.json()
        goal_id = body["goal_id"]
        text = body["text"]

        return process_entry(journal, goal_id, text)
    except KeyError:
        return {"error": "goal_id and text are required"}

@app.post("/api/goals")
async def create_goal_route(request: Request):
    journal = storage.load()
    try:
        body = await request.json()
        title = body["title"]

        return create_goal(journal, title)
    except KeyError:
        return {"error": "title is required"}