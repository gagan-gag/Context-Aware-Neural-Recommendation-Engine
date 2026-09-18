import os
import shutil
import sys
import tempfile
from pathlib import Path

from pyspark.sql import SparkSession

from backend.app.core.config import Settings, get_settings

LOCAL_SPARK_DIR = Path(tempfile.gettempdir()) / "avero-spark"


def _resolve_java_home() -> str | None:
    """Prefer a supported JDK 17 when multiple JDKs are installed."""
    candidates = [
        os.environ.get("JAVA_HOME"),
        r"C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot",
        r"C:\Program Files\Java\jdk-17",
        r"C:\Program Files\Java\jdk-17.0.2",
    ]

    for candidate in candidates:
        if not candidate:
            continue
        java_bin = Path(candidate) / "bin" / ("java.exe" if os.name == "nt" else "java")
        if java_bin.exists():
            return str(Path(candidate).resolve())

    java_path = shutil.which("java")
    if java_path:
        return str(Path(java_path).resolve().parent.parent)

    return None


def _get_safe_python_executable() -> str:
    """Return the active interpreter for Spark workers.

    Copying the venv Python into a temp directory breaks PySpark worker startup
    when the workspace path contains characters such as apostrophes because the
    copied executable is no longer a valid venv interpreter (missing pyvenv.cfg).
    """
    current_python = Path(sys.executable).resolve()
    if current_python.exists():
        return str(current_python)

    safe_dir = Path(tempfile.gettempdir()) / "avero-spark-runtime"
    safe_dir.mkdir(parents=True, exist_ok=True)
    safe_python = safe_dir / "python.exe"

    if not safe_python.exists():
        shutil.copy2(current_python, safe_python)

    return str(safe_python)


def _configure_local_spark_runtime() -> None:
    """Ensure Spark uses a stable Python interpreter and compatible JDK."""
    python_executable = _get_safe_python_executable()
    os.environ["PYSPARK_PYTHON"] = python_executable
    os.environ["PYSPARK_DRIVER_PYTHON"] = python_executable
    os.environ.setdefault("SPARK_LOCAL_IP", "127.0.0.1")

    java_home = _resolve_java_home()
    if java_home:
        os.environ["JAVA_HOME"] = java_home
        java_bin = Path(java_home) / "bin"
        os.environ["PATH"] = str(java_bin) + os.pathsep + os.environ.get("PATH", "")

    LOCAL_SPARK_DIR.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("SPARK_LOCAL_DIRS", str(LOCAL_SPARK_DIR))


def create_local_spark_session(
    app_name: str = "AVERO Local Spark",
    shuffle_partitions: int = 1,
) -> SparkSession:
    """Create a deterministic local Spark session for ML jobs and tests."""
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
        .appName(app_name)
        .master("local[1]")
        .config("spark.ui.enabled", "false")
        .config("spark.sql.session.timeZone", "UTC")
        .config("spark.local.dir", str(LOCAL_SPARK_DIR))
        .config("spark.sql.shuffle.partitions", str(shuffle_partitions))
        .config("spark.default.parallelism", "1")
        .config("spark.sql.adaptive.enabled", "false")
        .config("spark.python.worker.reuse", "false")
        .config("spark.driver.host", "127.0.0.1")
        .config("spark.driver.bindAddress", "127.0.0.1")
        .config("spark.driver.extraJavaOptions", java_options)
        .config("spark.executor.extraJavaOptions", java_options)
        .getOrCreate()
    )


def get_spark_session(settings: Settings | None = None) -> SparkSession:
    settings = settings or get_settings()
    return create_local_spark_session(
        app_name=settings.spark_app_name,
        shuffle_partitions=1,
    )
