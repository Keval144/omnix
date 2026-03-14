from rag.vector_store import search_documents


def retrieve_ml_context(dataset_info):

    problem = dataset_info.get("problem_type", "machine learning")
    domain = dataset_info.get("domain", "tabular")

    query = f"""
                machine learning pipeline for {problem} dataset
                domain {domain}
                data preprocessing model training evaluation
            """

    docs = search_documents(query)

    context = "\n".join(docs)

    return context