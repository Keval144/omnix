from pathlib import Path

import pandas as pd


class DatasetAnalyzer:
    @staticmethod
    def analyze(path: str) -> dict:
        suffix = Path(path).suffix.lower()
        if suffix == ".csv":
            dataframe = pd.read_csv(path)
        else:
            dataframe = pd.read_excel(path)

        return {
            "rows": int(dataframe.shape[0]),
            "columns": int(dataframe.shape[1]),
            "column_names": list(dataframe.columns),
            "column_types": dataframe.dtypes.astype(str).to_dict(),
            "missing_values": dataframe.isnull().sum().to_dict(),
            "sample_rows": dataframe.head(15).to_dict(orient="records"),
        }


from pathlib import Path
import pandas as pd


class DatasetAnalyzer:
    @staticmethod
    def analyze(path: str) -> dict:

        suffix = Path(path).suffix.lower()

        if suffix == ".csv":
            dataframe = pd.read_csv(path)
        else:
            dataframe = pd.read_excel(path)

        dataset_info = {
            "rows": int(dataframe.shape[0]),
            "columns": int(dataframe.shape[1]),
            "column_names": list(dataframe.columns),
            "column_types": dataframe.dtypes.astype(str).to_dict(),
            "missing_values": dataframe.isnull().sum().to_dict(),
            "sample_rows": dataframe.head(15).to_dict(orient="records"),
        }

        # Add RAG metadata
        dataset_info["problem_type"] = detect_problem_type(dataframe)
        dataset_info["domain"] = detect_domain(dataframe)

        return dataset_info


def analyze_dataset_file(path: str) -> dict:
    return DatasetAnalyzer.analyze(path)


def detect_problem_type(df):

    target = df.columns[-1]

    # If target is categorical
    if df[target].dtype == "object":
        return "classification"

    # Few unique values → classification
    if df[target].nunique() < 20:
        return "classification"

    return "regression"


def detect_domain(df):

    columns = " ".join(df.columns).lower()

    if "date" in columns or "time" in columns:
        return "time-series"

    if "text" in columns or "review" in columns:
        return "nlp"

    return "tabular"

def analyze_dataset_file(path: str) -> dict:
    return DatasetAnalyzer.analyze(path)

