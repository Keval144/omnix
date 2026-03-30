NOTEBOOK_GENERATION_PROMPT = """You are a senior machine learning engineer.

Generate a Kaggle-style machine learning notebook.

Machine Learning Knowledge:
{context}

Dataset Information:
{dataset_info}

Dataset filename:
{file_name}

Return ONLY valid JSON with the following structure:

{{
"imports": "",
"data_loading": "",
"eda": "",
"preprocessing": "",
"feature_engineering": "",
"train_test_split": "",
"model_training": "",
"evaluation": "",
"visualization": ""
}}

Rules:
- Return JSON only
- Do not include explanations
- Only Python code inside the fields"""


NOTEBOOK_SECTIONS = [
    {"key": "imports", "title": "Import Libraries"},
    {"key": "data_loading", "title": "Load Dataset"},
    {"key": "eda", "title": "Exploratory Data Analysis"},
    {"key": "preprocessing", "title": "Data Preprocessing"},
    {"key": "feature_engineering", "title": "Feature Engineering"},
    {"key": "train_test_split", "title": "Train Test Split"},
    {"key": "model_training", "title": "Model Training"},
    {"key": "evaluation", "title": "Model Evaluation"},
    {"key": "visualization", "title": "Visualization"},
]


def build_notebook_prompt(rag_context: str, dataset_info: dict, file_name: str) -> str:
    return NOTEBOOK_GENERATION_PROMPT.format(
        context=rag_context,
        dataset_info=dataset_info,
        file_name=file_name,
    )
