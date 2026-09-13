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

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        populate_by_name=True,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

