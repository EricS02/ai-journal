
def fills_for(goal, entries):
    fills = {}
    for subtask in goal["subtasks"]:
        fills[subtask["id"]] = 0
    
    for entry in entries:
      if entry["goal_id"] != goal["id"]:
        continue
      for e in entry["evidence"]:
        fills[e["subtask_id"]] = min(1.0, fills[e["subtask_id"]] + e["delta"])
    
    return fills

def goal_progress(goal, fills):
    total_weight = 0;
    weighted_sum = 0
    for subtask in goal["subtasks"]:
        total_weight += subtask["weight"]
        weighted_sum += subtask["weight"] * fills[subtask["id"]]
        
    return round((weighted_sum / total_weight) * 100)


