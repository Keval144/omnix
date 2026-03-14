import chromadb
from sentence_transformers import SentenceTransformer

# Initialize embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize vector database
client = chromadb.Client()

# Create or get collection
collection = client.get_or_create_collection(
    name="ml_knowledge"
)


def add_document(doc_text: str, doc_id: str):
    """
    Add a knowledge document to vector database
    """

    embedding = embedding_model.encode(doc_text).tolist()

    collection.add(
        documents=[doc_text],
        embeddings=[embedding],
        ids=[doc_id]
    )


def search_documents(query: str, k: int = 4):
    """
    Search relevant documents from vector DB
    """

    query_embedding = embedding_model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k
    )

    return results["documents"][0]