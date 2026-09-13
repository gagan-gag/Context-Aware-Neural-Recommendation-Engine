import csv
import json
from dataclasses import dataclass
from pathlib import Path

from backend.app.core.config import Settings, get_settings
from ml.data.schemas import (
    ARTICLE_REQUIRED_COLUMNS,
    CUSTOMER_REQUIRED_COLUMNS,
    TRANSACTION_REQUIRED_COLUMNS,
)


class DatasetLoadError(ValueError):
    """Raised when configured recommendation data cannot be loaded safely."""


@dataclass
class DatasetBundle:
    mode: str
    articles: list[dict]
    customers: list[dict]
    transactions: list[dict]


def _read_csv(path: Path, required_columns: set[str]) -> list[dict]:
    if not path.is_file():
        raise DatasetLoadError(f"Required H&M dataset file is missing: {path}")

    with path.open("r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)

        if reader.fieldnames is None:
            raise DatasetLoadError(f"Dataset file has no header row: {path.name}")

        missing_columns = required_columns - set(reader.fieldnames)
        if missing_columns:
            missing = ", ".join(sorted(missing_columns))
            raise DatasetLoadError(
                f"Dataset file '{path.name}' is missing required columns: {missing}"
            )

        return list(reader)


def _read_demo_json(path: Path) -> list[dict]:
    if not path.is_file():
        raise DatasetLoadError(f"Required demo data file is missing: {path}")

    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise DatasetLoadError(f"Demo data must be a JSON list: {path.name}")

    return data


def _load_demo_dataset(data_dir: Path) -> DatasetBundle:
    products = _read_demo_json(data_dir / "products.json")
    users = _read_demo_json(data_dir / "users.json")

    return DatasetBundle(
        mode="demo",
        articles=products,
        customers=users,
        transactions=[],
    )


def _load_real_hm_dataset(data_dir: Path) -> DatasetBundle:
    return DatasetBundle(
        mode="real",
        articles=_read_csv(data_dir / "articles.csv", ARTICLE_REQUIRED_COLUMNS),
        customers=_read_csv(data_dir / "customers.csv", CUSTOMER_REQUIRED_COLUMNS),
        transactions=_read_csv(
            data_dir / "transactions_train.csv",
            TRANSACTION_REQUIRED_COLUMNS,
        ),
    )


def load_dataset(settings: Settings | None = None) -> DatasetBundle:
    settings = settings or get_settings()

    if settings.mode == "demo":
        return _load_demo_dataset(settings.demo_data_dir)

    if settings.mode == "real":
        if not settings.hm_data_dir:
            raise DatasetLoadError(
                "HM_DATA_DIR is required when AVERO_MODE=real. "
                "Set it to the folder containing the H&M CSV files."
            )

        return _load_real_hm_dataset(Path(settings.hm_data_dir))

    raise DatasetLoadError(
        f"Unsupported AVERO_MODE '{settings.mode}'. Use 'demo' or 'real'."
    )
