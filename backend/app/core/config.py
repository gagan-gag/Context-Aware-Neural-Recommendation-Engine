from datetime import date
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    app_name: str = "AVERO"

    mode: Literal["demo", "real"] = Field(
        default="demo",
        validation_alias="AVERO_MODE",
    )
    demo_data_dir: Path = Field(
        default=PROJECT_ROOT / "data" / "demo",
        validation_alias="AVERO_DATA_DIR",
    )
    hm_data_dir: str | None = Field(
        default=None,
        validation_alias="HM_DATA_DIR",
    )

    spark_master: str = Field(
        default="local[*]",
        validation_alias="SPARK_MASTER",
    )
    spark_app_name: str = Field(
        default="AVERO Transaction Processing",
        validation_alias="SPARK_APP_NAME",
    )
    processed_data_dir: Path = Field(
        default=PROJECT_ROOT / "data" / "processed",
        validation_alias="PROCESSED_DATA_DIR",
    )
    processing_start_date: date | None = Field(
        default=None,
        validation_alias="PROCESSING_START_DATE",
    )
    processing_end_date: date | None = Field(
        default=None,
        validation_alias="PROCESSING_END_DATE",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        populate_by_name=True,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

