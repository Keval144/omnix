from fastapi import FastAPI
from routes.dataset_routes import router as dataset_router
from routes.notebook_routes import router as notebook_router
from routes.execution_routes import router as execution_router

app = FastAPI(title="AI Notebook Generator")

app.include_router(dataset_router)
app.include_router(notebook_router)
app.include_router(execution_router)


@app.get("/")
def root():
    return {"message": "Backend is running"}