from dotenv import load_dotenv
from openai import OpenAI
import json

load_dotenv()
client = OpenAI()

SUBTASKS_INSTRUCTIONS = """\
You break a person's learning goal into 5-8 milestones that measure progress.
You will assign eac model a 1-5 importance weight (5 = central to the goal, 1 = minor/nice to have)
alongside it's description.

You do NOT recommend a path, curriculum, or order to do things in. Each milestone
is a capability the person would have, described so it's true no matter how they
got there — not an activity or a study step.

Good: "Can read and modify code they didn't write"
Bad:  "Complete a course on reading code" (that's a recommended path)
"""

SUBTASKS_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["subtasks"],
    "properties": {
        "subtasks": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["description", "weight"],
                "properties": {
                    "description": {"type": "string"},
                    "weight": {"type": "integer", "enum": [1, 2, 3, 4, 5]},
                }
            }
        }
    }
}

PROGRESS_INSTRUCTIONS = """\
You judge how far along someone is against a fixed list of milestones, based on
what they say they did today.

For each milestone genuinely affected by today's entry, return its id and a
confidence score from 0.0 to 1.0 (how strongly this entry demonstrates that
milestone), plus a one-sentence reason. Be conservative — most days only touch
one or two milestones, and high confidence should be rare, reserved for entries
that clearly and directly demonstrate the capability.

Do not suggest what to do next. Just measure what already happened. Do not
invent a milestone id that wasn't given to you.
"""





CONCEPTS_INSTRUCTIONS = """\
You extract the concepts someone touched today, to build a long-term map of
everything they've learned.

For each concept give: name (1-4 words, e.g. "list comprehension"), summary (one
sentence), and related (other concept names it connects to - prefer names already
on their map so it links up, not scattered islands).

Extract 1-6 real concepts, not activities. "debugging a for loop" is not a
concept; "for loop" and "debugging" are. Reuse existing names exactly when it's
the same idea.
"""



CONCEPTS_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["concepts"],
    "properties": {
        "concepts": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["name", "summary", "related"],
                "properties": {
                    "name": {"type": "string"},
                    "summary": {"type": "string"},
                    "related": {"type": "array", "items": {"type": "string"}}
                }
            }
        }
    }
}


def plan_subtasks(goal_title):
    response = client.responses.create(
        model="gpt-5.6-luna",
        max_output_tokens=1000,
        input=f"My goal: {goal_title}",
        instructions=SUBTASKS_INSTRUCTIONS,
        text={
            "format": {
                "type": "json_schema",
                "name": "result",
                "schema": SUBTASKS_SCHEMA,
                "strict": True
            }
        }
    )
    output = response.output_text
    
    parsed = json.loads(output)
    
    return parsed["subtasks"]



def update_progress(goal, fills, entry_text):
    
    milestone_text = ""
    
    goal_title = goal["title"]
    
    valid_ids = []
    
    for subtask in goal["subtasks"]:
        valid_ids.append(subtask["id"])
        milestone_text += f" - {subtask['id']}: {subtask['description']} (currently {round(fills[subtask['id']] * 100)}%)\n"
    
    PROGRESS_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["updates"],
    "properties": {
        "updates": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["subtask_id", "confidence", "reason"],
                "properties": {
                    "subtask_id": {"type": "string", "enum": valid_ids},
                    "confidence": {"type": "number"},
                    "reason": {"type": "string"}
                }
            }
        }
    }
}

    response = client.responses.create(
        model="gpt-5.6-luna",
        max_output_tokens=2000,
        input= f"{goal_title}\n{milestone_text}\n{entry_text}",
        instructions=PROGRESS_INSTRUCTIONS,
        text={
            "format": {
                "type": "json_schema",
                "name": "result",
                "schema": PROGRESS_SCHEMA,
                "strict": True
            }
        }
    )   
    
    output = response.output_text
    parsed = json.loads(output)
    
    return parsed["updates"]


def extract_concepts(entry_text, known_concept_names):
    known_text = ", ".join(known_concept_names)
    
    response = client.responses.create(
        model="gpt-5.6-luna",
        max_output_tokens=2000,
        input=f"Concepts I already know: {known_text}\n\nWhat I did: {entry_text}",
        instructions=CONCEPTS_INSTRUCTIONS,
        text={
            "format": {
                "type": "json_schema",
                "name": "result",
                "schema": CONCEPTS_SCHEMA,
                "strict": True
            }
        }
    )
    
    output = response.output_text
    parsed = json.loads(output)
    
    return parsed["concepts"]


