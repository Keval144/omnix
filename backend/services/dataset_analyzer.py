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


def analyze_dataset_file(path: str) -> dict:
    return DatasetAnalyzer.analyze(path)
