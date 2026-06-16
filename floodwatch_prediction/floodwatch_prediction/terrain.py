import math
from typing import Tuple
import ee


CELL_SIZE_M = 92.77


def load_merit_hydro(aoi: ee.Geometry) -> ee.Image:
    return ee.Image("MERIT/Hydro/v1_0_1").clip(aoi)


def compute_slope(merit: ee.Image) -> ee.Image:
    return ee.Terrain.slope(merit.select("elv")).rename("Slope")


def compute_twi(merit: ee.Image) -> ee.Image:
    dir_band = merit.select("dir").toInt()

    cardinal = dir_band.remap([1, 4, 16, 64], [1, 1, 1, 1], 0)
    diagonal = dir_band.remap([2, 8, 32, 128], [1, 1, 1, 1], 0)

    flow_length = (
        cardinal.multiply(CELL_SIZE_M)
        .add(diagonal.multiply(CELL_SIZE_M / math.sqrt(2)))
        .where(cardinal.add(diagonal).eq(0), CELL_SIZE_M)
    )

    specific_catchment_area = (
        merit.select("upa")
        .multiply(1_000_000)
        .divide(flow_length)
        .max(1)
    )

    slope_deg = compute_slope(merit)
    slope_rad = slope_deg.multiply(math.pi / 180.0).where(slope_deg.eq(0), 0.001)
    tan_slope = slope_rad.tan().max(0.001)

    return specific_catchment_area.divide(tan_slope).log().rename("TWI")


def compute_river_distance(
    merit: ee.Image,
    river_upstream_area_threshold_km2: float = 10,
) -> ee.Image:
    """Computes approximate distance to river in meters."""
    rivers = merit.select("upa").gt(river_upstream_area_threshold_km2)

    return (
        rivers
        .reproject(crs="EPSG:3857", scale=100)
        .fastDistanceTransform()
        .multiply(100)
        .reproject(crs="EPSG:4326", scale=92)
        .rename("River_Distance")
    )


def get_percentile_bounds(
    image: ee.Image,
    aoi: ee.Geometry,
    scale: int = 500,
    percentiles: Tuple[int, int] = (5, 95),
) -> Tuple[float, float]:
    result = image.reduceRegion(
        reducer=ee.Reducer.percentile(list(percentiles)),
        geometry=aoi,
        scale=scale,
        maxPixels=1e9,
    ).getInfo()

    values = list(result.values())
    if len(values) < 2:
        raise RuntimeError(f"Could not compute percentile bounds for image: {result}")

    return float(values[0]), float(values[1])


def normalize(image: ee.Image, lo: float, hi: float) -> ee.Image:
    return image.subtract(lo).divide(ee.Number(hi).subtract(lo)).clamp(0, 1)


def normalize_inverted(image: ee.Image, lo: float, hi: float) -> ee.Image:
    return ee.Image(1).subtract(normalize(image, lo, hi))
