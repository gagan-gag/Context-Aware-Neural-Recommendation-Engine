import csv

import pytest

from backend.app.core.config import Settings
from ml.data.loader import DatasetLoadError, load_dataset


def write_csv(path, columns, rows):
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)


def test_demo_mode_loads_existing_demo_data() -> None:
    dataset = load_dataset(Settings(mode="demo"))

    assert dataset.mode == "demo"
    assert len(dataset.articles) > 0
    assert len(dataset.customers) > 0


def test_real_mode_requires_hm_data_directory() -> None:
    with pytest.raises(DatasetLoadError, match="HM_DATA_DIR is required"):
        load_dataset(Settings(mode="real", hm_data_dir=None))


def test_real_mode_reports_missing_files(tmp_path) -> None:
    settings = Settings(mode="real", hm_data_dir=str(tmp_path))

    with pytest.raises(DatasetLoadError, match="articles.csv"):
        load_dataset(settings)


def test_real_mode_validates_required_columns(tmp_path) -> None:
    write_csv(tmp_path / "articles.csv", ["article_id"], [{"article_id": "1"}])
    write_csv(
        tmp_path / "customers.csv",
        ["customer_id"],
        [{"customer_id": "customer-1"}],
    )
    write_csv(
        tmp_path / "transactions_train.csv",
        ["t_dat"],
        [{"t_dat": "2020-01-01"}],
    )

    settings = Settings(mode="real", hm_data_dir=str(tmp_path))

    with pytest.raises(DatasetLoadError, match="missing required columns"):
        load_dataset(settings)
