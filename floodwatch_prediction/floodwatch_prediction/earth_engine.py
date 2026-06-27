import ee


def initialize_earth_engine(project_id: str, authenticate: bool = False) -> None:
    """Initializes Google Earth Engine."""
    if authenticate:
        ee.Authenticate()
    ee.Initialize(project=project_id)
