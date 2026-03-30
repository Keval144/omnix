import logging
import os
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from config import get_settings
from constants import DATASETS_DIRNAME, NOTEBOOKS_DIRNAME

settings = get_settings()
logger = logging.getLogger(__name__)


def ensure_directory(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def build_dataset_directory(user_id: str, project_slug: str) -> str:
    return os.path.join(str(settings.storage_root), DATASETS_DIRNAME, user_id, project_slug)


def build_notebook_directory(user_id: str, project_slug: str) -> str:
    return os.path.join(str(settings.storage_root), NOTEBOOKS_DIRNAME, user_id, project_slug)


async def save_upload_file(upload_file: UploadFile, destination_dir: str) -> tuple[str, int]:
    try:
        ensure_directory(destination_dir)
        safe_name = f"{uuid4()}_{Path(upload_file.filename or 'dataset').name}"
        destination_path = os.path.join(destination_dir, safe_name)
        
        logger.info(f"Saving upload file to: {destination_path}")
        
        content = await upload_file.read()
        file_size = len(content)
        
        logger.info(f"File content read, size: {file_size} bytes")
        
        with open(destination_path, "wb") as file_obj:
            file_obj.write(content)
            
        logger.info(f"File saved successfully: {destination_path}")
        return destination_path, file_size
        
    except Exception as e:
        logger.error(f"Error saving upload file: {str(e)}", exc_info=True)
        raise


def write_text_file(destination_dir: str, filename: str, content: str) -> str:
    ensure_directory(destination_dir)
    destination_path = os.path.join(destination_dir, filename)
    with open(destination_path, "w", encoding="utf-8") as file_obj:
        file_obj.write(content)
    return destination_path


def build_public_storage_path(kind: str, user_id: str, project_slug: str, filename: str) -> str:
    prefix = settings.data_storage_url_prefix.rstrip("/")
    return f"{prefix}/{kind}/{user_id}/{project_slug}/{filename}" if prefix else f"/{kind}/{user_id}/{project_slug}/{filename}"


def resolve_storage_path(path: str) -> str:
    path_obj = Path(path)
    
    if path_obj.is_absolute() and path_obj.exists():
        return str(path_obj)

    normalized = path.replace("\\", "/")
    prefix = settings.data_storage_url_prefix.rstrip("/")
    
    if prefix and normalized.startswith(prefix):
        normalized = normalized[len(prefix):].lstrip("/")
    
    path_parts = Path(normalized).parts
    if path_parts and path_parts[0] in (DATASETS_DIRNAME, NOTEBOOKS_DIRNAME):
        return str((settings.storage_root / normalized).resolve())

    return str(path_obj)
