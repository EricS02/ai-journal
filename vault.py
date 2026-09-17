import os
import shutil
from urllib.parse import quote

import progress
import storage

journal = storage.load()

def create_folder(journal):
    count = 0

    if os.path.exists("vault/Goals"):
        shutil.rmtree("vault/Goals")
        os.makedirs("vault/Goals")
    else:
        os.makedirs("vault/Goals")
    for j in journal["goals"]:
        create_files(j, journal["entries"])
        count += 1
    return f"Exported {count} goals to the vault"


def create_files(goal, entries):
    fills = progress.fills_for(goal, entries)
    note_content = f"# {goal['title']}\n"
    for subtask in goal["subtasks"]:
        note_content += f"- {subtask['description']} (currently {(fills[subtask['id'] ]) * 100}%)\n" 
    with open(
        f"vault/Goals/{safe_filename(goal['title'])}.md", "w", encoding="utf-8"
    ) as f:
        f.write(note_content)


def create_concept_folder(journal):
    count = 0
    if os.path.exists("vault/Concepts"):
        shutil.rmtree("vault/Concepts")
        os.makedirs("vault/Concepts")
    else:
        os.makedirs("vault/Concepts")

    for j in journal["concepts"]:
        create_concept_files(j)
        count += 1
    return f"Exported {count} concepts to the vault"


def create_concept_files(concept):

    concept_content = f"# {concept['name']}\n{concept['summary']}\n"
    for c in concept["related"]:
        concept_content += f" - [[{c}]]\n"
    with open(
        f"vault/Concepts/{safe_filename(concept['name'])}.md", "w", encoding="utf-8"
    ) as f:
        f.write(concept_content)


def safe_filename(name):
    illegal_characters = '\\/:*?"<>|'  # the 8 characters
    for char in illegal_characters:
        name = name.replace(char, "")  # reassign name using .replace
    return name


def open_vault():
    path = "vault"
    absolute_path = os.path.abspath(path)
    uri_string = f"obsidian://open?path={quote(absolute_path)}"

    return os.startfile(uri_string)
