from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import logging

from rag.vector_store import search_documents

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rag", tags=["RAG Knowledge Base"])


class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 4
    include_source: Optional[bool] = False


class SearchResult(BaseModel):
    content: str
    source: Optional[str] = None
    score: Optional[float] = None


class SearchResponse(BaseModel):
    query: str
    num_results: int
    results: list[SearchResult]
    knowledge_files: list[str]


class KnowledgeStats(BaseModel):
    total_files: int
    files: list[dict]


@router.post("/search", response_model=SearchResponse)
async def search_knowledge(request: SearchRequest):
    """
    Search the ML knowledge base using RAG.
    
    - **query**: Search query (e.g., "how to handle missing values")
    - **top_k**: Number of results to return (default: 4)
    - **include_source**: Include source file names (default: False)
    """
    try:
        results = search_documents(request.query, k=request.top_k)
        
        search_results = []
        for result in results:
            if request.include_source:
                # Try to find which file this content came from
                source = _find_source_file(result)
            else:
                source = None
            
            search_results.append(SearchResult(
                content=result,
                source=source
            ))
        
        # Get available knowledge files
        from pathlib import Path
        from config import BASE_DIR
        knowledge_dir = BASE_DIR / "knowledge"
        files = []
        if knowledge_dir.exists():
            for f in sorted(knowledge_dir.glob("*.txt")):
                files.append({
                    "name": f.name,
                    "size_kb": round(f.stat().st_size / 1024, 2)
                })
        
        return SearchResponse(
            query=request.query,
            num_results=len(search_results),
            results=search_results,
            knowledge_files=[f["name"] for f in files]
        )
    
    except Exception as e:
        logger.error(f"RAG search error: {e}")
        return SearchResponse(
            query=request.query,
            num_results=0,
            results=[],
            knowledge_files=[]
        )


@router.get("/stats", response_model=KnowledgeStats)
async def get_knowledge_stats():
    """Get statistics about the knowledge base."""
    from pathlib import Path
    from config import BASE_DIR
    
    knowledge_dir = BASE_DIR / "knowledge"
    files = []
    
    if knowledge_dir.exists():
        for f in sorted(knowledge_dir.glob("*.txt")):
            content = f.read_text(encoding="utf-8")
            files.append({
                "name": f.name,
                "size_kb": round(f.stat().st_size / 1024, 2),
                "lines": content.count('\n') + 1,
                "words": len(content.split()),
                "chars": len(content)
            })
    
    return KnowledgeStats(
        total_files=len(files),
        files=files
    )


@router.get("/files")
async def list_knowledge_files():
    """List all available knowledge files."""
    from pathlib import Path
    from config import BASE_DIR
    
    knowledge_dir = BASE_DIR / "knowledge"
    files = []
    
    if knowledge_dir.exists():
        for f in sorted(knowledge_dir.glob("*.txt")):
            files.append({
                "name": f.name,
                "path": str(f.relative_to(BASE_DIR)),
                "size_kb": round(f.stat().st_size / 1024, 2)
            })
    
    return {"files": files, "count": len(files)}


@router.get("/file/{filename}")
async def get_file_content(filename: str):
    """Get the full content of a knowledge file."""
    from pathlib import Path
    from config import BASE_DIR
    import re
    
    knowledge_dir = BASE_DIR / "knowledge"
    file_path = knowledge_dir / filename
    
    if not file_path.exists():
        return {"error": f"File not found: {filename}"}
    
    if not file_path.suffix == ".txt":
        return {"error": "Only .txt files are supported"}
    
    content = file_path.read_text(encoding="utf-8")
    
    # Extract sections based on markdown headings
    sections = []
    lines = content.split('\n')
    current_section = {"title": "Introduction", "content": []}
    
    for line in lines:
        if line.startswith('#'):
            if current_section["content"]:
                sections.append(current_section)
            current_section = {"title": line.lstrip('#').strip(), "content": []}
        else:
            current_section["content"].append(line)
    
    if current_section["content"]:
        sections.append(current_section)
    
    # Join content for each section
    for section in sections:
        section["content"] = '\n'.join(section["content"]).strip()
    
    return {
        "filename": filename,
        "sections": sections,
        "stats": {
            "size_kb": round(file_path.stat().st_size / 1024, 2),
            "lines": len(lines),
            "sections": len(sections)
        }
    }


@router.post("/reindex")
async def reindex_knowledge():
    """Re-index all knowledge files into the vector store."""
    try:
        from rag.ingest_knowledge import ingest
        
        ingest()
        
        return {
            "status": "success",
            "message": "Knowledge base re-indexed successfully"
        }
    except Exception as e:
        logger.error(f"Re-index error: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@router.get("/test/{topic}")
async def test_topic(topic: str):
    """Test RAG with predefined ML topics."""
    
    test_topics = {
        "data-cleaning": "how to handle missing values outliers duplicates data cleaning",
        "feature-engineering": "feature engineering encoding scaling polynomial features",
        "model-selection": "when to use random forest vs xgboost vs linear regression",
        "model-training": "train test split cross validation grid search pipeline",
        "model-evaluation": "RMSE MAE R2 confusion matrix classification metrics",
        "testing": "unit testing overfitting bias variance cross validation",
        "deployment": "save model pickle joblib fastapi production monitoring",
        "classification": "classification pipeline imbalanced data precision recall",
        "regression": "regression pipeline linear regression ridge lasso",
        "nlp": "text classification sentiment analysis tokenization TF-IDF",
        "time-series": "time series forecasting ARIMA LSTM seasonality stationarity"
    }
    
    topic_key = topic.lower().replace("-", "_")
    
    if topic_key not in test_topics:
        return {
            "error": f"Unknown topic: {topic}",
            "available_topics": list(test_topics.keys())
        }
    
    query = test_topics[topic_key]
    results = search_documents(query, k=3)
    
    return {
        "topic": topic,
        "query": query,
        "num_results": len(results),
        "results": [
            {
                "preview": r[:500] + "..." if len(r) > 500 else r,
                "length": len(r)
            }
            for r in results
        ]
    }


def _find_source_file(content: str, max_chars: int = 1000) -> str:
    """Try to identify which file the content came from."""
    from pathlib import Path
    from config import BASE_DIR
    
    knowledge_dir = BASE_DIR / "knowledge"
    if not knowledge_dir.exists():
        return "unknown"
    
    # Check first N chars against file contents
    check_content = content[:max_chars]
    
    for f in knowledge_dir.glob("*.txt"):
        try:
            file_content = f.read_text(encoding="utf-8")
            if check_content in file_content:
                return f.name
        except:
            continue
    
    return "unknown"
