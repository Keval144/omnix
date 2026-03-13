from fastapi import APIRouter, UploadFile, File
from services.dataset_service import save_dataset, analyze_dataset

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    path = await save_dataset(file)
    summary = analyze_dataset(path)

    return {
        "dataset_path": path,
        "summary": summary
    }