from rag.vector_store import search_documents


RAG_QUERIES = {
    ("classification", "tabular"): "classification pipeline tabular data machine learning preprocessing model training evaluation",
    ("regression", "tabular"): "regression pipeline tabular data continuous target feature engineering model training evaluation",
    ("classification", "nlp"): "NLP text classification sentiment analysis transformer BERT preprocessing model training",
    ("regression", "nlp"): "NLP text regression sentiment score prediction transformer embeddings",
    ("classification", "time_series"): "time series classification sequence data LSTM RNN model training forecasting",
    ("regression", "time_series"): "time series forecasting regression ARIMA Prophet LSTM model training prediction",
    ("text_generation", "nlp"): "text generation language model GPT transformer seq2seq text preprocessing tokens",
    ("time_series_forecasting", "time_series"): "time series forecasting ARIMA Prophet LSTM sequence prediction model training",
    ("classification", "deep_learning"): "deep learning neural network CNN image classification transfer learning ResNet training",
    ("regression", "deep_learning"): "deep learning regression neural network MLP training optimization",
    ("classification", "computer_vision"): "computer vision CNN image classification transfer learning ResNet VGG training",
    ("regression", "computer_vision"): "computer vision regression image prediction CNN model training",
}


def retrieve_ml_context(dataset_info):
    problem = dataset_info.get("problem_type", "classification")
    domain = dataset_info.get("domain", "tabular")

    query_key = (problem, domain)
    query = RAG_QUERIES.get(
        query_key,
        f"{problem} {domain} machine learning pipeline data preprocessing model training evaluation"
    )

    docs = search_documents(query, k=6)

    context = "\n".join(docs)

    return context