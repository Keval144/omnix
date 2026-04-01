NOTEBOOK_SECTIONS_TEMPLATES = {
    "tabular_classification": [
        {"key": "imports", "title": "Import Libraries"},
        {"key": "data_loading", "title": "Load Dataset"},
        {"key": "eda", "title": "Exploratory Data Analysis"},
        {"key": "class_analysis", "title": "Class Distribution Analysis"},
        {"key": "preprocessing", "title": "Data Preprocessing"},
        {"key": "feature_engineering", "title": "Feature Engineering"},
        {"key": "train_test_split", "title": "Train Test Split"},
        {"key": "model_training", "title": "Model Training"},
        {"key": "model_saving", "title": "Model Saving"},
        {"key": "evaluation", "title": "Model Evaluation"},
        {"key": "visualization", "title": "Visualization"},
    ],
    "tabular_regression": [
        {"key": "imports", "title": "Import Libraries"},
        {"key": "data_loading", "title": "Load Dataset"},
        {"key": "eda", "title": "Exploratory Data Analysis"},
        {"key": "target_analysis", "title": "Target Distribution Analysis"},
        {"key": "preprocessing", "title": "Data Preprocessing"},
        {"key": "feature_engineering", "title": "Feature Engineering"},
        {"key": "train_test_split", "title": "Train Test Split"},
        {"key": "model_training", "title": "Model Training"},
        {"key": "model_saving", "title": "Model Saving"},
        {"key": "evaluation", "title": "Model Evaluation"},
        {"key": "residual_analysis", "title": "Residual Analysis"},
        {"key": "visualization", "title": "Visualization"},
    ],
    "nlp": [
        {"key": "imports", "title": "Import Libraries"},
        {"key": "data_loading", "title": "Load Dataset"},
        {"key": "text_exploration", "title": "Text Exploration"},
        {"key": "text_cleaning", "title": "Text Cleaning"},
        {"key": "tokenization", "title": "Tokenization"},
        {"key": "vectorization", "title": "Vectorization / Embeddings"},
        {"key": "train_test_split", "title": "Train Test Split"},
        {"key": "model_training", "title": "Model Training"},
        {"key": "model_saving", "title": "Model Saving"},
        {"key": "evaluation", "title": "Model Evaluation"},
        {"key": "visualization", "title": "Visualization"},
    ],
    "time_series": [
        {"key": "imports", "title": "Import Libraries"},
        {"key": "data_loading", "title": "Load Dataset"},
        {"key": "time_exploration", "title": "Time Series Exploration"},
        {"key": "decomposition", "title": "Time Series Decomposition"},
        {"key": "preprocessing", "title": "Data Preprocessing"},
        {"key": "feature_engineering", "title": "Time-Based Feature Engineering"},
        {"key": "train_test_split", "title": "Time-Based Train Test Split"},
        {"key": "model_training", "title": "Model Training"},
        {"key": "model_saving", "title": "Model Saving"},
        {"key": "evaluation", "title": "Model Evaluation"},
        {"key": "forecasting", "title": "Forecasting"},
        {"key": "visualization", "title": "Visualization"},
    ],
    "deep_learning": [
        {"key": "imports", "title": "Import Libraries"},
        {"key": "data_loading", "title": "Load Dataset"},
        {"key": "preprocessing", "title": "Data Preprocessing"},
        {"key": "dataset_split", "title": "Train/Validation/Test Split"},
        {"key": "model_architecture", "title": "Model Architecture"},
        {"key": "model_compilation", "title": "Model Compilation"},
        {"key": "callbacks", "title": "Callbacks & Early Stopping"},
        {"key": "training", "title": "Model Training"},
        {"key": "model_saving", "title": "Model Saving"},
        {"key": "evaluation", "title": "Model Evaluation"},
        {"key": "visualization", "title": "Training Visualization"},
    ],
    "computer_vision": [
        {"key": "imports", "title": "Import Libraries"},
        {"key": "data_loading", "title": "Load Images"},
        {"key": "preprocessing", "title": "Image Preprocessing"},
        {"key": "augmentation", "title": "Data Augmentation"},
        {"key": "train_test_split", "title": "Train Test Split"},
        {"key": "model_architecture", "title": "Model Architecture"},
        {"key": "training", "title": "Model Training"},
        {"key": "model_saving", "title": "Model Saving"},
        {"key": "evaluation", "title": "Model Evaluation"},
        {"key": "visualization", "title": "Results Visualization"},
    ],
    "text_generation": [
        {"key": "imports", "title": "Import Libraries"},
        {"key": "data_loading", "title": "Load Dataset"},
        {"key": "text_cleaning", "title": "Text Cleaning"},
        {"key": "tokenization", "title": "Tokenization"},
        {"key": "vocabulary", "title": "Vocabulary Building"},
        {"key": "sequences", "title": "Sequence Creation"},
        {"key": "train_test_split", "title": "Train Test Split"},
        {"key": "model_architecture", "title": "Language Model Architecture"},
        {"key": "training", "title": "Model Training"},
        {"key": "model_saving", "title": "Model Saving"},
        {"key": "generation", "title": "Text Generation"},
    ],
    "default": [
        {"key": "imports", "title": "Import Libraries"},
        {"key": "data_loading", "title": "Load Dataset"},
        {"key": "eda", "title": "Exploratory Data Analysis"},
        {"key": "preprocessing", "title": "Data Preprocessing"},
        {"key": "feature_engineering", "title": "Feature Engineering"},
        {"key": "train_test_split", "title": "Train Test Split"},
        {"key": "model_training", "title": "Model Training"},
        {"key": "model_saving", "title": "Model Saving"},
        {"key": "evaluation", "title": "Model Evaluation"},
        {"key": "visualization", "title": "Visualization"},
    ],
}

PROBLEM_PROMPTS = {
    "tabular_classification": """You are a senior machine learning engineer specializing in tabular classification.

                                Generate a Kaggle-style classification notebook for tabular data.

                                Machine Learning Knowledge:
                                {context}

                                Dataset Information:
                                {dataset_info}

                                Dataset filename: {file_name}

                                Target variable type: Classification (categorical target)
                                Recommended models: Random Forest, XGBoost, LightGBM, Logistic Regression
                                Evaluation metrics: accuracy, precision, recall, f1-score, roc-auc, confusion matrix

                                Model Saving: Use joblib.dump() or pickle to save the trained model to disk. Include code for saving the model to a file (e.g., 'model.joblib') and loading it back for predictions. Save any important preprocessing objects along with the model.

                                Return ONLY valid JSON with the following structure:

                                {{
                                "imports": "",
                                "data_loading": "",
                                "eda": "",
                                "class_analysis": "",
                                "preprocessing": "",
                                "feature_engineering": "",
                                "train_test_split": "",
                                "model_training": "",
                                "model_saving": "",
                                "evaluation": "",
                                "visualization": ""
                                }}

                                Rules:
                                - Return JSON only
                                - Do not include explanations
                                - Only Python code inside the fields""",

                                    "tabular_regression": """You are a senior machine learning engineer specializing in tabular regression.

                                Generate a Kaggle-style regression notebook for tabular data.

                                Machine Learning Knowledge:
                                {context}

                                Dataset Information:
                                {dataset_info}

                                Dataset filename: {file_name}

                                Target variable type: Regression (continuous target)
                                Recommended models: Random Forest, XGBoost, LightGBM, Ridge, Linear Regression
                                Evaluation metrics: RMSE, MAE, R^2, MAPE

                                Model Saving: Use joblib.dump() or pickle to save the trained model to disk. Include code for saving the model to a file (e.g., 'model.joblib') and loading it back for predictions.

                                Return ONLY valid JSON with the following structure:

                                {{
                                "imports": "",
                                "data_loading": "",
                                "eda": "",
                                "target_analysis": "",
                                "preprocessing": "",
                                "feature_engineering": "",
                                "train_test_split": "",
                                "model_training": "",
                                "model_saving": "",
                                "evaluation": "",
                                "residual_analysis": "",
                                "visualization": ""
                                }}

                                Rules:
                                - Return JSON only
                                - Do not include explanations
                                - Only Python code inside the fields""",

                                    "nlp": """You are a senior NLP engineer specializing in text classification and sentiment analysis.

                                Generate a Kaggle-style NLP notebook.

                                Machine Learning Knowledge:
                                {context}

                                Dataset Information:
                                {dataset_info}

                                Dataset filename: {file_name}

                                Problem type: NLP (Text Classification/Sentiment Analysis)
                                Recommended approaches: TF-IDF + Logistic Regression, BERT, DistilBERT, transformers
                                Evaluation metrics: accuracy, f1-score, precision, recall

                                Model Saving: Save trained model, tokenizer, vectorizer to disk using joblib or pickle. Include code to save and load back for predictions.

                                Return ONLY valid JSON with the following structure:

                                {{
                                "imports": "",
                                "data_loading": "",
                                "text_exploration": "",
                                "text_cleaning": "",
                                "tokenization": "",
                                "vectorization": "",
                                "train_test_split": "",
                                "model_training": "",
                                "model_saving": "",
                                "evaluation": "",
                                "visualization": ""
                                }}

                                Rules:
                                - Return JSON only
                                - Do not include explanations
                                - Only Python code inside the fields""",

                                    "time_series": """You are a senior data scientist specializing in time series forecasting.

                                Generate a Kaggle-style time series forecasting notebook.

                                Machine Learning Knowledge:
                                {context}

                                Dataset Information:
                                {dataset_info}

                                Dataset filename: {file_name}

                                Problem type: Time Series Forecasting
                                Recommended approaches: ARIMA, Prophet, LSTM, XGBoost with lag features
                                Evaluation metrics: RMSE, MAE, MAPE, SMAPE

                                Model Saving: Save trained model to disk using appropriate method (joblib for sklearn, model.save() for Keras, torch.save() for PyTorch). Include code for saving and loading.

                                Return ONLY valid JSON with the following structure:

                                {{
                                "imports": "",
                                "data_loading": "",
                                "time_exploration": "",
                                "decomposition": "",
                                "preprocessing": "",
                                "feature_engineering": "",
                                "train_test_split": "",
                                "model_training": "",
                                "model_saving": "",
                                "evaluation": "",
                                "forecasting": "",
                                "visualization": ""
                                }}

                                Rules:
                                - Return JSON only
                                - Do not include explanations
                                - Only Python code inside the fields""",

                                    "deep_learning": """You are a senior deep learning engineer specializing in neural networks.

                                Generate a Kaggle-style deep learning notebook using TensorFlow/Keras or PyTorch.

                                Machine Learning Knowledge:
                                {context}

                                Dataset Information:
                                {dataset_info}

                                Dataset filename: {file_name}

                                Problem type: Deep Learning / Neural Network
                                Recommended architectures: MLP, Dense networks with BatchNorm and Dropout
                                Use Adam optimizer, appropriate loss functions for classification/regression
                                Include early stopping, learning rate reduction callbacks

                                Model Saving: Save model weights and architecture using model.save() for Keras or torch.save() for PyTorch. Include code for saving the complete model and loading it back.

                                Return ONLY valid JSON with the following structure:

                                {{
                                "imports": "",
                                "data_loading": "",
                                "preprocessing": "",
                                "dataset_split": "",
                                "model_architecture": "",
                                "model_compilation": "",
                                "callbacks": "",
                                "training": "",
                                "model_saving": "",
                                "evaluation": "",
                                "visualization": ""
                                }}

                                Rules:
                                - Return JSON only
                                - Do not include explanations
                                - Only Python code inside the fields""",

                                    "computer_vision": """You are a senior computer vision engineer specializing in image classification.

                                Generate a Kaggle-style computer vision notebook.

                                Machine Learning Knowledge:
                                {context}

                                Dataset Information:
                                { dataset_info}

                                Dataset filename: {file_name}

                                Problem type: Computer Vision (Image Classification)
                                Recommended approaches: CNN, Transfer Learning (ResNet, VGG, EfficientNet)
                                Use ImageDataGenerator or tf.data for data pipeline

                                Model Saving: Save trained model using model.save() for Keras or torch.save() for PyTorch. Include code for saving model weights and loading for inference.

                                Return ONLY valid JSON with the following structure:

                                {{
                                "imports": "",
                                "data_loading": "",
                                "preprocessing": "",
                                "augmentation": "",
                                "train_test_split": "",
                                "model_architecture": "",
                                "training": "",
                                "model_saving": "",
                                "evaluation": "",
                                "visualization": ""
                                }}

                                Rules:
                                - Return JSON only
                                - Do not include explanations
                                - Only Python code inside the fields""",

                                    "text_generation": """You are a senior NLP engineer specializing in text generation and language modeling.

                                Generate a Kaggle-style text generation notebook.

                                Machine Learning Knowledge:
                                {context}

                                Dataset Information:
                                {dataset_info}

                                Dataset filename: {file_name}

                                Problem type: Text Generation / Language Modeling
                                Recommended approaches: LSTM, GRU, Transformer, GPT-style models

                                Model Saving: Save model weights, tokenizer, and vocabulary to disk. Use appropriate methods (model.save() for Keras, torch.save() for PyTorch, pickle for other components).

                                Return ONLY valid JSON with the following structure:

                                {{
                                "imports": "",
                                "data_loading": "",
                                "text_cleaning": "",
                                "tokenization": "",
                                "vocabulary": "",
                                "sequences": "",
                                "train_test_split": "",
                                "model_architecture": "",
                                "training": "",
                                "model_saving": "",
                                "generation": ""
                                }}

                                Rules:
                                - Return JSON only
                                - Do not include explanations
                                - Only Python code inside the fields""",

                                    "default": """You are a senior machine learning engineer.

                                Generate a Kaggle-style machine learning notebook.

                                Machine Learning Knowledge:
                                {context}

                                Dataset Information:
                                {dataset_info}

                                Dataset filename: {file_name}

                                Model Saving: Save trained model to disk using joblib.dump() or pickle. Include code for saving and loading the model for predictions.

                                Return ONLY valid JSON with the following structure:

                                {{
                                "imports": "",
                                "data_loading": "",
                                "eda": "",
                                "preprocessing": "",
                                "feature_engineering": "",
                                "train_test_split": "",
                                "model_training": "",
                                "model_saving": "",
                                "evaluation": "",
                                "visualization": ""
                                }}

                                Rules:
                                - Return JSON only
                                - Do not include explanations
                                - Only Python code inside the fields""",
}


def get_template_key(problem_type: str, domain: str) -> str:
    if domain == "computer_vision":
        return "computer_vision"
    if domain == "deep_learning":
        return "deep_learning"
    if domain == "nlp" and problem_type == "text_generation":
        return "text_generation"
    if domain == "nlp":
        return "nlp"
    if domain == "time_series" or problem_type == "time_series_forecasting":
        return "time_series"
    if problem_type == "classification":
        return "tabular_classification"
    if problem_type == "regression":
        return "tabular_regression"
    return "default"


def get_notebook_sections(problem_type: str, domain: str) -> list[dict]:
    key = get_template_key(problem_type, domain)
    return NOTEBOOK_SECTIONS_TEMPLATES.get(key, NOTEBOOK_SECTIONS_TEMPLATES["default"])


def build_notebook_prompt(rag_context: str, dataset_info: dict, file_name: str) -> str:
    problem_type = dataset_info.get("problem_type", "classification")
    domain = dataset_info.get("domain", "tabular")

    template_key = get_template_key(problem_type, domain)
    prompt_template = PROBLEM_PROMPTS.get(template_key, PROBLEM_PROMPTS["default"])

    return prompt_template.format(
        context=rag_context,
        dataset_info=dataset_info,
        file_name=file_name,
    )


NOTEBOOK_SECTIONS = NOTEBOOK_SECTIONS_TEMPLATES["default"]
NOTEBOOK_GENERATION_PROMPT = PROBLEM_PROMPTS["default"]
