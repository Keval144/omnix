import os
from fastapi import UploadFile
from services.dataset_analyzer import analyze_dataset_file

DATASET_DIR = "storage/datasets"

os.makedirs(DATASET_DIR, exist_ok=True)


async def save_dataset(file: UploadFile):
    path = os.path.join(DATASET_DIR, file.filename)

    contents = await file.read()

    with open(path, "wb") as f:
        f.write(contents)

    return path


def analyze_dataset(path):
    return analyze_dataset_file(path)