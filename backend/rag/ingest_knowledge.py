import os
from vector_store import add_document

KNOWLEDGE_DIR = "knowledge"


def ingest():

    if not os.path.exists(KNOWLEDGE_DIR):
        print("Knowledge folder not found")
        return

    for file in os.listdir(KNOWLEDGE_DIR):

        path = os.path.join(KNOWLEDGE_DIR, file)

        if not file.endswith(".txt"):
            continue

        with open(path, "r", encoding="utf-8") as f:
            text = f.read()

        add_document(text, file)

        print(f"Ingested {file}")

    print("Knowledge base created successfully")


if __name__ == "__main__":
    ingest()