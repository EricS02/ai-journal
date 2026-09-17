import json
import os



def load():
     if os.path.exists("journal.json"):
       with open ("journal.json", "r", encoding="utf-8") as f:
           return json.load(f)
     else:
         starting_dic = {
            "goals": [],
            "entries": [],
            "concepts": [],
            "active_goal_id": None
        }

     return starting_dic



def save(journal):
    with open ("journal.json", "w", encoding="utf-8") as f:
        json.dump(journal, f, indent=2)



