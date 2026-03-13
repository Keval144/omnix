from fastapi import APIRouter
from services.notebook_service import generate_notebook

router = APIRouter(prefix="/notebooks", tags=["notebooks"])


@router.post("/generate")
def create_notebook(dataset_path: str):
    notebook_path = generate_notebook(dataset_path)

    return {
        "notebook_path": notebook_path
    }