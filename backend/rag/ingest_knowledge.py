import os
from pathlib import Path

from config import BASE_DIR
from rag.vector_store import add_document


def ingest():
    knowledge_dir = BASE_DIR / "knowledge"

    if not knowledge_dir.exists():
        print(f"Knowledge folder not found at {knowledge_dir}")
        return

    txt_files = sorted(knowledge_dir.glob("*.txt"))
    
    if not txt_files:
        print("No .txt files found in knowledge directory")
        return

    for path in txt_files:
        file_name = path.name
        
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()

        add_document(text, file_name)
        print(f"Ingested {file_name}")

    print(f"\nKnowledge base created successfully ({len(txt_files)} files)")


if __name__ == "__main__":
    ingest()
