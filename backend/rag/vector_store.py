from pathlib import Path

from config import BASE_DIR

try:
    import chromadb
except Exception:  # pragma: no cover
    chromadb = None

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover
    SentenceTransformer = None


_embedding_model = None
_collection = None
_knowledge_dir = BASE_DIR / "knowledge"


def _get_embedding_model():
    global _embedding_model
    if _embedding_model is not None or SentenceTransformer is None:
        return _embedding_model

    try:
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    except Exception:
        _embedding_model = None
    return _embedding_model


def _get_collection():
    global _collection
    if _collection is not None or chromadb is None:
        return _collection

    try:
        _collection = chromadb.Client().get_or_create_collection(name="ml_knowledge")
    except Exception:
        _collection = None
    return _collection


def _load_text_fallback() -> list[str]:
    if not _knowledge_dir.exists():
        return []

    documents: list[str] = []
    for path in sorted(_knowledge_dir.glob("*.txt")):
        try:
            documents.append(path.read_text(encoding="utf-8"))
        except OSError:
            continue
    return documents


def add_document(doc_text: str, doc_id: str):
    embedding_model = _get_embedding_model()
    collection = _get_collection()
    if embedding_model is None or collection is None:
        return

    embedding = embedding_model.encode(doc_text).tolist()
    collection.add(documents=[doc_text], embeddings=[embedding], ids=[doc_id])


def search_documents(query: str, k: int = 4):
    embedding_model = _get_embedding_model()
    collection = _get_collection()
    if embedding_model is None or collection is None:
        return _load_text_fallback()[:k]

    try:
        query_embedding = embedding_model.encode(query).tolist()
        results = collection.query(query_embeddings=[query_embedding], n_results=k)
        return results.get("documents", [[]])[0]
    except Exception:
        return _load_text_fallback()[:k]
