import os
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from config import get_settings
from constants import DATASETS_DIRNAME, NOTEBOOKS_DIRNAME

settings = get_settings()


def ensure_directory(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def build_dataset_directory(user_id: str, project_slug: str) -> str:
    return os.path.join(str(settings.storage_root), DATASETS_DIRNAME, user_id, project_slug)


def build_notebook_directory(user_id: str, project_slug: str) -> str:
    return os.path.join(str(settings.storage_root), NOTEBOOKS_DIRNAME, user_id, project_slug)


async def save_upload_file(upload_file: UploadFile, destination_dir: str) -> tuple[str, int]:
    ensure_directory(destination_dir)
    safe_name = f"{uuid4()}_{Path(upload_file.filename or 'dataset').name}"
    destination_path = os.path.join(destination_dir, safe_name)
    content = await upload_file.read()
    with open(destination_path, "wb") as file_obj:
        file_obj.write(content)
    return destination_path, len(content)


def write_text_file(destination_dir: str, filename: str, content: str) -> str:
    ensure_directory(destination_dir)
    destination_path = os.path.join(destination_dir, filename)
    with open(destination_path, "w", encoding="utf-8") as file_obj:
        file_obj.write(content)
    return destination_path


def build_public_storage_path(kind: str, user_id: str, project_slug: str, filename: str) -> str:
    prefix = settings.data_storage_url_prefix.rstrip("/")
    if kind == NOTEBOOKS_DIRNAME:
        return f"{prefix}/{kind}/{project_slug}/{filename}" if prefix else f"/{kind}/{project_slug}/{filename}"
    return f"{prefix}/{kind}/{user_id}/{project_slug}/{filename}" if prefix else f"/{kind}/{user_id}/{project_slug}/{filename}"


def resolve_storage_path(path: str) -> str:
    path_obj = Path(path)
    if path_obj.is_absolute() and path_obj.exists():
        return str(path_obj)

    normalized = path.replace("\\", "/")
    prefix = settings.data_storage_url_prefix.rstrip("/")
    if prefix and normalized.startswith(prefix):
        normalized = normalized[len(prefix):]

    normalized = normalized.lstrip("/")
    if normalized.startswith(f"{DATASETS_DIRNAME}/") or normalized.startswith(f"{NOTEBOOKS_DIRNAME}/"):
        return str((settings.storage_root / normalized).resolve())

    return str(path_obj)
