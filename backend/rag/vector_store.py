import logging
import time
from pathlib import Path

from config import BASE_DIR

logger = logging.getLogger(__name__)

try:
    import chromadb
except Exception:
    chromadb = None

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None


_embedding_model = None
_collection = None
_knowledge_dir = BASE_DIR / "knowledge"
_model_init_time: float | None = None
_collection_init_time: float | None = None
RETRY_DELAY = 60
_MAX_RETRIES = 3


def _get_embedding_model(force_retry: bool = False):
    global _embedding_model, _model_init_time

    if _embedding_model is not None:
        return _embedding_model

    if SentenceTransformer is None:
        return None

    if not force_retry and _model_init_time is not None:
        if time.monotonic() - _model_init_time < RETRY_DELAY:
            return None

    try:
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        _model_init_time = time.monotonic()
        logger.info("Embedding model loaded successfully")
    except Exception as e:
        logger.warning(f"Failed to load embedding model: {e}")
        _model_init_time = time.monotonic()
        _embedding_model = None

    return _embedding_model


def _get_collection(force_retry: bool = False):
    global _collection, _collection_init_time

    if _collection is not None:
        return _collection

    if chromadb is None:
        return None

    if not force_retry and _collection_init_time is not None:
        if time.monotonic() - _collection_init_time < RETRY_DELAY:
            return None

    try:
        _collection = chromadb.Client().get_or_create_collection(name="ml_knowledge")
        _collection_init_time = time.monotonic()
        logger.info("ChromaDB collection initialized successfully")
    except Exception as e:
        logger.warning(f"Failed to initialize ChromaDB collection: {e}")
        _collection_init_time = time.monotonic()
        _collection = None

    return _collection


def reset_vector_store():
    global _embedding_model, _collection, _model_init_time, _collection_init_time
    _embedding_model = None
    _collection = None
    _model_init_time = None
    _collection_init_time = None


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


def add_document(doc_text: str, doc_id: str, retry: bool = True):
    embedding_model = _get_embedding_model(force_retry=retry)
    collection = _get_collection(force_retry=retry)
    if embedding_model is None or collection is None:
        return

    try:
        embedding = embedding_model.encode(doc_text).tolist()
        collection.add(documents=[doc_text], embeddings=[embedding], ids=[doc_id])
    except Exception as e:
        logger.warning(f"Failed to add document: {e}")
        if retry:
            reset_vector_store()
            add_document(doc_text, doc_id, retry=False)


def search_documents(query: str, k: int = 4, retry: bool = True):
    embedding_model = _get_embedding_model(force_retry=retry)
    collection = _get_collection(force_retry=retry)
    if embedding_model is None or collection is None:
        return _load_text_fallback()[:k]

    try:
        query_embedding = embedding_model.encode(query).tolist()
        results = collection.query(query_embeddings=[query_embedding], n_results=k)
        return results.get("documents", [[]])[0]
    except Exception as e:
        logger.warning(f"Search failed: {e}")
        if retry:
            reset_vector_store()
            return search_documents(query, k, retry=False)
        return _load_text_fallback()[:k]