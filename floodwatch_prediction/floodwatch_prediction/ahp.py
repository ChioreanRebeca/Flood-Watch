from dataclasses import dataclass
from typing import Dict
import ee
from .terrain import (
    compute_slope,
    compute_twi,
    compute_river_distance,
    get_percentile_bounds,
    normalize,
    normalize_inverted,
)


@dataclass(frozen=True)
class AHPWeights:
    runoff_q: float = 0.4522
    api: float = 0.2366
    twi: float = 0.1229
    distance_to_river: float = 0.0916
    slope: float = 0.0558
    elevation: float = 0.0410

    def as_dict(self) -> Dict[str, float]:
        return {
            "runoff_q": self.runoff_q,
            "api": self.api,
            "twi": self.twi,
            "distance_to_river": self.distance_to_river,
            "slope": self.slope,
            "elevation": self.elevation,
        }


def compute_flood_risk_index(
    aoi: ee.Geometry,
    merit: ee.Image,
    api: ee.Image,
    runoff_q: ee.Image,
    river_upstream_area_threshold_km2: float,
    weights: AHPWeights = AHPWeights(),
) -> tuple[ee.Image, Dict[str, tuple[float, float]]]:
   
    twi = compute_twi(merit)
    slope = compute_slope(merit)
    elevation = merit.select("elv").rename("Elevation")
    river_distance = compute_river_distance(
        merit,
        river_upstream_area_threshold_km2=river_upstream_area_threshold_km2,
    )

    bounds = {
        "twi": get_percentile_bounds(twi, aoi),
        "api": get_percentile_bounds(api, aoi),
        "runoff_q": get_percentile_bounds(runoff_q, aoi),
        "distance_to_river": get_percentile_bounds(river_distance, aoi),
        "elevation": get_percentile_bounds(elevation, aoi),
        "slope": get_percentile_bounds(slope, aoi),
    }

    twi_norm = normalize(twi, *bounds["twi"])
    api_norm = normalize(api, *bounds["api"])
    q_norm = normalize(runoff_q, *bounds["runoff_q"])
    distance_norm = normalize_inverted(river_distance, *bounds["distance_to_river"])
    elevation_norm = normalize_inverted(elevation, *bounds["elevation"])
    slope_norm = normalize_inverted(slope, *bounds["slope"])

    flood_risk_index = (
        q_norm.multiply(weights.runoff_q)
        .add(api_norm.multiply(weights.api))
        .add(twi_norm.multiply(weights.twi))
        .add(distance_norm.multiply(weights.distance_to_river))
        .add(slope_norm.multiply(weights.slope))
        .add(elevation_norm.multiply(weights.elevation))
        .rename("Flood_Risk_Index")
    )

    return flood_risk_index, bounds
