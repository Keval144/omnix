import papermill as pm
import os

from utils.storage import resolve_storage_path

EXEC_DIR = "storage/executions"

os.makedirs(EXEC_DIR, exist_ok=True)


def execute_notebook(notebook_path):

    output_path = os.path.join(EXEC_DIR, "executed_notebook.ipynb")
    resolved_notebook_path = resolve_storage_path(notebook_path)

    pm.execute_notebook(
        resolved_notebook_path,
        output_path
    )

    return output_path
