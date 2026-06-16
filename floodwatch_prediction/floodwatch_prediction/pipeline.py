import json
from datetime import datetime, timezone
from pathlib import Path
import ee

from .ahp import AHPWeights, compute_flood_risk_index
from .aoi import build_aoi
from .config import FloodPredictionConfig
from .earth_engine import initialize_earth_engine
from .export import risk_index_to_warning_points, export_geojson
from .precipitation import (
    calculate_api,
    calculate_amc_precip,
    calculate_gfs_precip,
    classify_amc,
)
from .runoff import (
    calculate_runoff_q,
    get_hsg_with_hand_override,
    load_corine_land_cover,
    map_curve_number,
)
from .terrain import load_merit_hydro


def run_prediction(
    config: FloodPredictionConfig,
    authenticate: bool = False,
) -> dict:
    """Runs the complete FloodWatch prediction pipeline and exports a GeoJSON."""
    config.ensure_output_dirs()
    initialize_earth_engine(config.project_id, authenticate=authenticate)

    aoi = build_aoi(config)
    merit = load_merit_hydro(aoi)

    api = calculate_api(aoi, config)
    amc_precip = calculate_amc_precip(aoi, config)
    amc_class = classify_amc(amc_precip)
    gfs_precip = calculate_gfs_precip(aoi, config)

    hsg = get_hsg_with_hand_override(aoi, config.hysg_asset_id)
    corine = load_corine_land_cover(aoi)
    curve_number = map_curve_number(hsg, amc_class, corine)
    runoff_q = calculate_runoff_q(gfs_precip, curve_number)

    weights = AHPWeights()
    flood_risk_index, bounds = compute_flood_risk_index(
        aoi=aoi,
        merit=merit,
        api=api,
        runoff_q=runoff_q,
        river_upstream_area_threshold_km2=config.river_upstream_area_threshold_km2,
        weights=weights,
    )

    warning_points = risk_index_to_warning_points(
        flood_risk_index=flood_risk_index,
        aoi=aoi,
        threshold=config.risk_threshold,
        scale=config.export_scale,
    )

    output_geojson = export_geojson(warning_points, config.output_geojson)

    metadata = {
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "city_name": config.city_name,
        "address_type": config.address_type,
        "today_date": config.today_date,
        "forecast_hours": config.forecast_hours,
        "api_lookback_days": config.api_lookback_days,
        "amc_lookback_days": config.amc_lookback_days,
        "risk_threshold": config.risk_threshold,
        "export_scale": config.export_scale,
        "output_geojson": output_geojson,
        "ahp_weights": weights.as_dict(),
        "normalization_bounds": bounds,
    }

    Path(config.metadata_json).write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    return metadata
