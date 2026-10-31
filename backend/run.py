import os
import uvicorn

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8001"))
    print(f"Starting Dharohar 4D Backend on {host}:{port}...")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
