import time
from typing import Optional, List
import requests
import ee
from .config import FloodPredictionConfig


def get_bbox(
    city_name: str = "Galati",
    address_type: str = "city",
    attempts: int = 10,
    timeout: int = 15,
) -> Optional[List[List[float]]]:
    """
    Replicates the working notebook AOI lookup.

    It queries Nominatim with polygon_geojson=1 and selects the first
    administrative result whose addresstype matches the configured value.
    Returns coordinates directly usable by ee.Geometry.Polygon().
    """
    url = (
        f"https://nominatim.openstreetmap.org/search.php"
        f"?q={city_name}&polygon_geojson=1&format=json"
    )

    # Same User-Agent style as the working notebook.
    headers = {
        "User-Agent": "FloodWatchApp/1.0 "
    }

    for attempt in range(attempts):
        try:
            response = requests.get(url, headers=headers, timeout=timeout)
            response.raise_for_status()
            data = response.json()

            if not data:
                print(f"No data found for {city_name}")
                return None

            city_data_match = None

            for city_data in data:
                if (
                    city_data.get("type") == "administrative"
                    and city_data.get("addresstype") == address_type
                    and city_data.get("geojson")
                ):
                    city_data_match = city_data
                    break

            if city_data_match is None:
                print(
                    f"No administrative result with addresstype='{address_type}' "
                    f"was found for {city_name}."
                )
                return None

            geometry = city_data_match.get("geojson", {})
            geometry_type = geometry.get("type")
            coordinates = geometry.get("coordinates")

            if geometry_type == "MultiPolygon":
                return coordinates[0][0]
            if geometry_type == "Polygon":
                return coordinates[0]

            print(f"Unsupported geometry type for AOI: {geometry_type}")
            return None

        except Exception as exc:
            print(f"Nominatim attempt {attempt + 1} failed: {exc}")
            time.sleep(2)

    return None


def build_aoi(config: FloodPredictionConfig) -> ee.Geometry:
    """Builds an Earth Engine AOI from Nominatim; falls back to config.default_bbox."""
    bounding_box = get_bbox(
        city_name=config.city_name,
        address_type=config.address_type,
    )

    if bounding_box:
        return ee.Geometry.Polygon(bounding_box)

    print("Failed to retrieve AOI for the given city and address type. Reverting to default bounding box.")
    return ee.Geometry.Polygon(config.default_bbox)
