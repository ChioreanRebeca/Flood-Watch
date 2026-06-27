import ee
from .config import FloodPredictionConfig


def calculate_api(aoi: ee.Geometry, config: FloodPredictionConfig) -> ee.Image:
    
    end_date = ee.Date(config.today_date)
    days = ee.List.sequence(1, config.api_lookback_days)

    def weighted_rain(day_number):
        day_number = ee.Number(day_number)
        date = end_date.advance(day_number.multiply(-1), "day")

        rain = (
            ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
            .filterDate(date, date.advance(1, "day"))
            .filterBounds(aoi)
            .select("precipitation")
            .sum()
            .clip(aoi)
        )

        weight = ee.Number(config.api_decay_k).pow(day_number)
        return rain.multiply(weight)

    return ee.ImageCollection.fromImages(days.map(weighted_rain)).sum().rename("API")


def calculate_amc_precip(aoi: ee.Geometry, config: FloodPredictionConfig) -> ee.Image:
    """Computes simple cumulative rainfall for AMC classification."""
    end_date = ee.Date(config.today_date)
    start_date = end_date.advance(-config.amc_lookback_days, "day")

    return (
        ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
        .filterBounds(aoi)
        .filterDate(start_date, end_date)
        .select("precipitation")
        .sum()
        .clip(aoi)
        .rename("AMC_Precip")
    )


def classify_amc(amc_precip: ee.Image) -> ee.Image:
    """Classifies AMC using growing-season NRCS TR-55 thresholds in millimeters."""
    return (
        ee.Image(2)
        .where(amc_precip.lt(35), 1)
        .where(amc_precip.gt(53), 3)
        .rename("AMC_Class")
    )


def calculate_gfs_precip(aoi: ee.Geometry, config: FloodPredictionConfig) -> ee.Image:
    """Aggregates GFS forecast precipitation for the configured forecast hours."""
    return (
        ee.ImageCollection("NOAA/GFS0P25")
        .filterDate(
            config.today_date,
            ee.Date(config.today_date).advance(1, "day"),
        )
        .filter(ee.Filter.inList("forecast_hours", config.forecast_hours))
        .select("total_precipitation_surface")
        .sum()
        .clip(aoi)
        .resample("bicubic")
        .reproject(crs="EPSG:4326", scale=1000)
        .rename("GFS_Precip")
    )
