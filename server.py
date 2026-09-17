from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import storage
import datetime

app = FastAPI()

origins = [
    "http://localhost:3000"
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