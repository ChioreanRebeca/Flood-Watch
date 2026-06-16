from pathlib import Path
import ee
import geemap


def risk_index_to_warning_points(
    flood_risk_index: ee.Image,
    aoi: ee.Geometry,
    threshold: float,
    scale: int,
) -> ee.FeatureCollection:
    """Converts high-risk pixels into centroid warning points."""
    critical_risk_mask = flood_risk_index.gt(threshold)

    return critical_risk_mask.selfMask().reduceToVectors(
        geometry=aoi,
        scale=scale,
        geometryType="centroid",
        maxPixels=1e9,
    )


def export_geojson(feature_collection: ee.FeatureCollection, output_path: str) -> str:
    """Exports an Earth Engine FeatureCollection to a local GeoJSON file."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    geemap.ee_export_vector(feature_collection, output_path)
    return output_path
