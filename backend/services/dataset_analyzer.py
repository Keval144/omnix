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
        dataset_info["complexity"] = detect_complexity(dataframe)

        return dataset_info


async def analyze_dataset_async(path: str) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, DatasetAnalyzer.analyze, path)


def detect_problem_type(df: pd.DataFrame) -> str:
    target = df.columns[-1]
    n_samples = len(df)
    n_features = len(df.columns) - 1

    target_dtype = df[target].dtype
    n_unique = df[target].nunique() if pd.api.types.is_numeric_dtype(df[target]) else df[target].nunique()

    if target_dtype == "object":
        avg_text_length = df[target].astype(str).str.len().mean()
        if avg_text_length > 100:
            return "text_generation"
        return "classification"

    if pd.api.types.is_datetime64_any_dtype(df[target]):
        return "time_series_forecasting"

    if n_unique < 20:
        return "classification"

    return "regression"


def detect_domain(df: pd.DataFrame) -> str:
    columns = " ".join(df.columns).lower()
    column_sample = df.iloc[:10].astype(str).values.flatten()

    n_samples = len(df)
    n_features = len(df.columns)

    if any(word in columns for word in ["image", "pixel", "img", "path", "url"]):
        return "computer_vision"

    if any(word in columns for word in ["date", "timestamp", "datetime", "year", "month", "day", "hour", "minute"]):
        return "time_series"

    if any(word in columns for word in ["text", "review", "comment", "description", "content", "article", "body", "title", "message"]):
        return "nlp"

    if n_samples > 50000 and n_features > 100:
        return "deep_learning"

    text_columns = sum(1 for col in df.columns if df[col].dtype == "object" and df[col].astype(str).str.len().mean() > 50)
    if text_columns > 0:
        return "nlp"

    return "tabular"


def detect_complexity(df: pd.DataFrame) -> str:
    n_samples = len(df)
    n_features = len(df.columns)
    missing_pct = (df.isnull().sum().sum() / (n_samples * n_features)) * 100

    if n_samples > 100000:
        return "large"
    elif n_samples > 10000:
        return "medium"
    else:
        return "small"


def analyze_dataset_file(path: str) -> dict:
    return DatasetAnalyzer.analyze(path)

