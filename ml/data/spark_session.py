import os
import shutil
import sys
import tempfile
from pathlib import Path

from pyspark.sql import SparkSession

from backend.app.core.config import Settings, get_settings

LOCAL_SPARK_DIR = Path(tempfile.gettempdir()) / "avero-spark"


def _get_safe_python_executable() -> str:
    """Return a stable Windows-safe Python path for Spark workers."""
    current_python = Path(sys.executable).resolve()
    if current_python.exists() and "'" not in str(current_python) and " " not in str(current_python):
        return str(current_python)

    safe_dir = Path(tempfile.gettempdir()) / "avero-spark-runtime"
    safe_dir.mkdir(parents=True, exist_ok=True)
    safe_python = safe_dir / "python.exe"

    if not safe_python.exists():
        shutil.copy2(current_python, safe_python)

    return str(safe_python)


def _configure_local_spark_runtime() -> None:
    """Ensure Spark uses a stable Python interpreter that Windows can launch reliably."""
    python_executable = _get_safe_python_executable()
    os.environ["PYSPARK_PYTHON"] = python_executable
    os.environ["PYSPARK_DRIVER_PYTHON"] = python_executable
    os.environ.setdefault("SPARK_LOCAL_IP", "127.0.0.1")

    LOCAL_SPARK_DIR.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("SPARK_LOCAL_DIRS", str(LOCAL_SPARK_DIR))


def get_spark_session(settings: Settings | None = None) -> SparkSession:
    settings = settings or get_settings()

    _configure_local_spark_runtime()
    os.environ["SPARK_LOCAL_IP"] = "127.0.0.1"
    LOCAL_SPARK_DIR.mkdir(parents=True, exist_ok=True)

    java_options = (
        "--add-opens=java.base/java.security=ALL-UNNAMED "
        "--add-opens=java.base/javax.security.auth=ALL-UNNAMED "
        "--add-opens=java.base/javax.security.auth.login=ALL-UNNAMED"
    )

    return (
        SparkSession.builder
        .appName(settings.spark_app_name)
        .master(settings.spark_master)
        .config("spark.ui.enabled", "false")
        .config("spark.sql.session.timeZone", "UTC")
        .config("spark.local.dir", str(LOCAL_SPARK_DIR))
        .config("spark.sql.shuffle.partitions", "1")
        .config("spark.default.parallelism", "1")
        .config("spark.sql.adaptive.enabled", "false")
        .config("spark.python.worker.reuse", "false")
        .config("spark.driver.host", "127.0.0.1")
        .config("spark.driver.bindAddress", "127.0.0.1")
        .config("spark.driver.extraJavaOptions", java_options)
        .config("spark.executor.extraJavaOptions", java_options)
        .getOrCreate()
    )
