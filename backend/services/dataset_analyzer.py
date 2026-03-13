import pandas as pd


def analyze_dataset_file(path):

    df = pd.read_csv(path)

    summary = {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": list(df.columns),
        "column_types": df.dtypes.astype(str).to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
        "sample_rows": df.head(5).to_dict()
    }

    return summary