# FloodWatch Prediction Module

This is a modular Python version of the original Jupyter notebook prototype.  
It does **not** create demonstration maps. Its final output is a GeoJSON file containing flood-risk warning points generated from the AHP Flood Risk Index.

## What the module does

1. Builds an area of interest from a Nominatim query.
2. Loads MERIT Hydro elevation and drainage layers.
3. Computes:
   - Topographic Wetness Index (TWI)
   - Antecedent Precipitation Index (API)
   - Antecedent Moisture Condition (AMC)
   - Dynamic Curve Number (CN)
   - Runoff Potential (Q)
   - Distance to river
   - Slope and elevation risk factors
4. Combines the normalized layers using AHP weights.
5. Exports high-risk pixels as centroid points in GeoJSON format.

## What the module does not do

It does not create Folium/geemap visual maps or PNG overlays. Those were kept only in the notebook for visual demonstration.

## Setup

Install dependencies:

```bash
pip install -r requirements.txt
```

Authenticate Google Earth Engine once:

```bash
earthengine authenticate
```

Then run:

```bash
python -m floodwatch_prediction.main --config config.example.yaml
```

The default output is:

```text
output/flood_warnings.geojson
```

## Configuration

Edit `config.example.yaml` before running. Important fields:

- `project_id`: your Google Earth Engine project ID
- `hysg_asset_id`: your uploaded HYSOGs250m asset ID
- `city_name`: target region name
- `address_type`: Nominatim address type, for example `county`, `city`, `municipality`
- `today_date`: forecast start date in `YYYY-MM-DD` format
- `risk_threshold`: threshold used to convert the risk raster into warning points

## Example

```bash

python -m floodwatch_prediction.main \
  --city-name "Galați" \
  --address-type county \
  --today-date 2024-09-15 \
  --project-id your-gee-project \
  --hysg-asset-id projects/your-project/assets/HYSOGs250m \
  --output output/flood_warnings.geojson
  
```
