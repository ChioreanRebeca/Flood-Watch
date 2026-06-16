from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional
import yaml


@dataclass
class FloodPredictionConfig:
    project_id: str
    city_name: str = "Galați"
    address_type: str = "county"
    today_date: str = "2024-09-15"

    api_lookback_days: int = 30
    amc_lookback_days: int = 5
    api_decay_k: float = 0.9
    forecast_hours: List[int] = field(default_factory=lambda: [6, 12, 18, 24])

    hysg_asset_id: str = "projects/gen-lang-client-0375557253/assets/HYSOGs250m"

    risk_threshold: float = 0.85
    export_scale: int = 30
    river_upstream_area_threshold_km2: float = 10

    nominatim_user_agent: str = "FloodWatchApp/1.0"
    output_geojson: str = "output/flood_warnings.geojson"
    metadata_json: str = "output/prediction_metadata.json"

    default_bbox: List[List[float]] = field(
        default_factory=lambda: [
            [27.8, 45.3],
            [28.2, 45.3],
            [28.2, 45.7],
            [27.8, 45.7],
            [27.8, 45.3],
        ]
    )

    @classmethod
    def from_yaml(cls, path: str | Path) -> "FloodPredictionConfig":
        with open(path, "r", encoding="utf-8") as file:
            data = yaml.safe_load(file) or {}
        return cls(**data)

    def ensure_output_dirs(self) -> None:
        Path(self.output_geojson).parent.mkdir(parents=True, exist_ok=True)
        Path(self.metadata_json).parent.mkdir(parents=True, exist_ok=True)
