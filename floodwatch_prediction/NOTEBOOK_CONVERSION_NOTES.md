# Notebook Conversion Notes

The original notebook contained map visualization cells and PNG thumbnail exports used for demonstration.  
Those parts were intentionally removed from the modular application.

Kept from the notebook:

- Nominatim AOI retrieval
- MERIT Hydro processing
- D8-aware TWI computation
- CHIRPS API calculation
- GFS precipitation aggregation for 6, 12, 18, and 24 forecast hours
- AMC classification
- Dynamic CN calculation using CORINE and HSG
- SCS-CN runoff calculation
- AHP weighted flood-risk index
- Conversion of high-risk pixels to centroid GeoJSON points

Removed from the notebook:

- `geemap.Map()`
- `Map.addLayer(...)`
- PNG thumbnail exports
- notebook-only debug visualization cells
