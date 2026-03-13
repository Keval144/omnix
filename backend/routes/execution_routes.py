from fastapi import APIRouter
from services.execution_service import execute_notebook

router = APIRouter(prefix="/execution", tags=["execution"])


@router.post("/run")
def run_notebook(notebook_path: str):
    output = execute_notebook(notebook_path)

    return {
        "executed_notebook": output
    }