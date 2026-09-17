import storage
import datetime

journal = storage.load()



def add_key(journal):
    date = datetime.date.today().isoformat()
    count = 0
    
    old_active_id = journal["active_goal_id"]
    for goal in journal["goals"]:
        count += 1
        subtask_count = 1
        
        goal["id"] = f"g{count}"
        
        
        if old_active_id is not None and count == old_active_id + 1:
            journal["active_goal_id"] = goal["id"]
        
        goal["created_at"] = date
        new_subtasks = []

        
        for subtask in goal["subtasks"]:

            new_dict = {"id": f"s{subtask_count}", "description": subtask["name"], "weight": 3}
            new_subtasks.append(new_dict)
            subtask_count +=1
            
        goal["subtasks"] = new_subtasks

        
        
        
add_key(journal)
storage.save(journal)     