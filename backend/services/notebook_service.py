import nbformat
import os

NOTEBOOK_DIR = "storage/notebooks"

os.makedirs(NOTEBOOK_DIR, exist_ok=True)


def generate_notebook(dataset_path):

    nb = nbformat.v4.new_notebook()

    cells = []

    cells.append(
        nbformat.v4.new_markdown_cell("# Auto Generated Machine Learning Notebook")
    )

    cells.append(
        nbformat.v4.new_markdown_cell("## Load Dataset")
    )

    cells.append(
        nbformat.v4.new_code_cell(
            f"""
import pandas as pd

df = pd.read_csv("{dataset_path}")
df.head()
"""
        )
    )

    cells.append(
        nbformat.v4.new_markdown_cell("## Train Model")
    )

    cells.append(
        nbformat.v4.new_code_cell(
            """
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

X = df.iloc[:, :-1]
y = df.iloc[:, -1]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier()

model.fit(X_train, y_train)

print("Model trained successfully")
"""
        )
    )

    nb["cells"] = cells

    path = os.path.join(NOTEBOOK_DIR, "generated_notebook.ipynb")

    with open(path, "w") as f:
        nbformat.write(nb, f)

    return path