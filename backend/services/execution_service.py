import papermill as pm
import os

EXEC_DIR = "storage/executions"

os.makedirs(EXEC_DIR, exist_ok=True)


def execute_notebook(notebook_path):

    output_path = os.path.join(EXEC_DIR, "executed_notebook.ipynb")

    pm.execute_notebook(
        notebook_path,
        output_path
    )

    return output_path