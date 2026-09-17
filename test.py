import datetime

import storage

journal = storage.load()


def add_mention_count(journal):
    for c in journal["concepts"]:
        if "mention_concept" not in c:
            c["mention_count"] = 1
            c["first_seen"] = datetime.date.today().isoformat()  # noqa: DTZ011
            print(f"Added {c['mention_count']} and {c['first_seen']}")


add_mention_count(journal)
storage.save(journal)
