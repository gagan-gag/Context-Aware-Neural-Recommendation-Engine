import os
import tempfile
from pathlib import Path

from pyspark.sql import SparkSession

from backend.app.core.config import Settings, get_settings

LOCAL_SPARK_DIR = Path(tempfile.gettempdir()) / "avero-spark"


def get_spark_session(settings: Settings | None = None) -> SparkSession:
    settings = settings or get_settings()

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
