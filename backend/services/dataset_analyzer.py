import asyncio
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pandas as pd

_executor = ThreadPoolExecutor(max_workers=2)


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

        dataset_info["problem_type"] = detect_problem_type(dataframe)
        dataset_info["domain"] = detect_domain(dataframe)

        return dataset_info


async def analyze_dataset_async(path: str) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, DatasetAnalyzer.analyze, path)


def detect_problem_type(df: pd.DataFrame) -> str:
    target = df.columns[-1]

    if df[target].dtype == "object":
        return "classification"

    if df[target].nunique() < 20:
        return "classification"

    return "regression"


def detect_domain(df: pd.DataFrame) -> str:
    columns = " ".join(df.columns).lower()

    if "date" in columns or "time" in columns:
        return "time-series"

    if "text" in columns or "review" in columns:
        return "nlp"

    return "tabular"


def analyze_dataset_file(path: str) -> dict:
    return DatasetAnalyzer.analyze(path)

