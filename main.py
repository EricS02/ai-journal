import datetime

import ai
import progress
import storage
import vault

journal = storage.load()


def progress_bar(percent):
    width = 20
    filled = round(width * percent / 100)

    filled_part = "=" * filled
    empty_part = " " * (width - filled)

    return f"[{filled_part}{empty_part}]"


def find_goal(journal, goal_id):
    for goal in journal["goals"]:
        if goal["id"] == goal_id:
            return goal
    return None


def find_matching_subtask(journal, goal_id, subtask_id):
    active_goal = find_goal(journal, goal_id)
    for subtask in active_goal["subtasks"]:
        if subtask["id"] == subtask_id:
            return subtask          
    return None
            
def score(item):
    return item["delta"] * item["weight"]


def create_goal(journal, title):
    subtasks = ai.plan_subtasks(title)

    new_subtask = []
    count = 0
    for s in subtasks:
        count += 1  # noqa: SIM113
        new_subtask.append(
            {
                "id": f"s{count}",
                "description": s["description"],
                "weight": s["weight"],
            }
        )

    goal_counter = f"g{len(journal['goals']) + 1}"
    created_at = datetime.date.today().isoformat()  # noqa: DTZ011
    new_goal = {
        "title": title,
        "subtasks": new_subtask,
        "id": goal_counter,
        "created_at": created_at,
    }

    journal["active_goal_id"] = new_goal["id"]
    journal["goals"].append(new_goal)

    storage.save(journal)
    return new_goal


def delete_goal(journal, goal_id):
    goal = find_goal(journal, goal_id)
    if goal is None:
        return {"error": "Needs to be a valid ID"}

    journal["goals"].remove(goal)

    if journal["active_goal_id"] == goal_id:
        journal["active_goal_id"] = journal["goals"][0]["id"] if journal["goals"] else None

    storage.save(journal)
    return {"deleted": goal_id}


def process_entry(journal, goal_id, text):

    active_goal = find_goal(journal, goal_id)

    fills = progress.fills_for(active_goal, journal["entries"])
    DELTA_FACTOR = 0.22
    updates = ai.update_progress(active_goal, fills, text)
    evidence = []
    
    for update in updates:
        matching_subtask = find_matching_subtask(journal, goal_id, update["subtask_id"])
        delta = min(
            1 - fills[update["subtask_id"]],
            round(update["confidence"] * DELTA_FACTOR, 2),
        )
        if delta <= 0:
            continue
        evidence.append(
            {
                "subtask_id": update["subtask_id"],
                "confidence": update["confidence"],
                "delta": delta,
                "reason": update["reason"],
                "description":matching_subtask["description"],
                "weight": matching_subtask["weight"],
                "before": fills[update["subtask_id"]]
            }
        )

    entry = {
        "id": f"e{len(journal['entries']) + 1}",
        "goal_id": active_goal["id"],
        "date": datetime.date.today().isoformat(),  # noqa: DTZ011
        "text": text,
        "evidence": evidence,
    }

    journal["entries"].append(entry)
    fills_after = progress.fills_for(active_goal, journal["entries"])

    storage.save(journal)
    print(progress_bar(progress.goal_progress(active_goal, fills)))

    known_concept_names = []
    for c in journal["concepts"]:
        known_concept_names.append(c["name"])

    new_concept_names = ai.extract_concepts(text, known_concept_names)

    for concept in new_concept_names:
        already_exists = False
        for c in journal["concepts"]:
            if c["name"] == concept["name"]:
                already_exists = True
                c["mention_count"] += 1
                break

        if not already_exists:
            concept["first_seen"] = datetime.date.today().isoformat()  # noqa: DTZ011
            concept["mention_count"] = 1
            journal["concepts"].append(concept)

    storage.save(journal)
    
    total_weight = 0
    for subtask in active_goal["subtasks"]:
        total_weight += subtask["weight"]
        
    evidence.sort(key=score, reverse=True)
    top_moves = evidence[:4]
        
    results = {
        "goalId": goal_id,
        "moves": top_moves,
        "empty": len(top_moves) == 0,
        "goalBefore": progress.goal_progress(active_goal, fills),
        "goalAfter": progress.goal_progress(active_goal, fills_after),
        "totalWeight": total_weight
        
    }
    return results 


if __name__ == "__main__":
    while True:
        user_input = input("> ").strip()

        parts = user_input.split(" ", 1)
        command = parts[0]
        argument = parts[1].strip() if len(parts) > 1 else ""

        if command == "/status":
            active_goal = find_goal(journal, journal["active_goal_id"])
            fills = progress.fills_for(active_goal, journal["entries"])
            print(f"Your active goal: {active_goal['title']}")
            print("Your progress", progress.goal_progress(active_goal, fills))
            print(progress_bar(progress.goal_progress(active_goal, fills)))

        elif user_input == "/quit":
            break

        elif command == "/goals":
            for goal in journal["goals"]:
                print(f"{goal['id']}: {goal['title']}")

        elif command == "/switch":
            get_id_after_command = user_input[len("/switch") :].strip()

            if find_goal(journal, get_id_after_command) is None:
                print("Needs to be a valid ID")
            else:
                journal["active_goal_id"] = get_id_after_command
                storage.save(journal)
                print(f"Switched to goal {get_id_after_command}")

        elif command == "/goal":
            get_text_after_command = user_input[len("/goal") :].strip()
            create_goal(journal, get_text_after_command)

        elif command == "/delete":
            get_id_after_command = user_input[len("/delete") :].strip()
            result = delete_goal(journal, get_id_after_command)
            print(result)

        elif user_input == "/map":
            goal_count = vault.create_folder(journal)
            concept_count = vault.create_concept_folder(journal)

            print(goal_count)
            print(concept_count)

        else:
            if journal["active_goal_id"] is None:
                print("No active goal yet - use /goal first")
            else:
                process_entry(journal, journal["active_goal_id"], user_input)
