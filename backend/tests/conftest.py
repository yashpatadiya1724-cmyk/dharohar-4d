import os
import shutil
import tempfile
import pytest

_TEST_DB_DIR = tempfile.mkdtemp(prefix="dharohar_test_")
os.environ["ADMIN_TOKEN"] = "test-admin-token"
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_TEST_DB_DIR, 'test.db')}"


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db_dir():
    yield
    shutil.rmtree(_TEST_DB_DIR, ignore_errors=True)
