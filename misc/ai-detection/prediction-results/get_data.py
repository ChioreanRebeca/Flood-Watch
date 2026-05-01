import ee
import os
import geemap

print("Authenticating with your personal Google account...")
ee.Authenticate() 
ee.Initialize(project='gen-lang-client-0375557253')

# Create the local 'data' folder if it doesn't exist
output_dir = 'data'
os.makedirs(output_dir, exist_ok=True)

# 1. Define Galați Bounding Box
galati_roi = ee.Geometry.Rectangle([27.20, 45.25, 28.30, 46.25])

def get_s1_mosaic(start_date, end_date):
    """Fetches Sentinel-1 RTC data from GEE and mosaics it."""
    collection = (ee.ImageCollection('COPERNICUS/S1_GRD')
        .filterBounds(galati_roi)
        .filterDate(start_date, end_date)
        .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
        .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
        .filter(ee.Filter.eq('instrumentMode', 'IW')))
    
    # We use mosaic to stitch overlapping satellite passes together
    return collection.mosaic().clip(galati_roi)

# 2. Get the Pre-Flood and Post-Flood Images
print("Locating satellite images...")
# Pre-flood: First week of September (Dry)
pre_flood_img = get_s1_mosaic('2024-09-01', '2024-09-10')

# Post-flood: Mid-September (During Cyclone Boris)
post_flood_img = get_s1_mosaic('2024-09-14', '2024-09-20')

# 3. Separate into VV and VH bands
pre_vv = pre_flood_img.select('VV')
pre_vh = pre_flood_img.select('VH')
post_vv = post_flood_img.select('VV')
post_vh = post_flood_img.select('VH')

# 4. Export Functions to Google Drive
def export_to_drive(image, filename):
    print(f"Starting export for {filename}...")
    task = ee.batch.Export.image.toDrive(
        image=image,
        description=filename,
        folder='Thesis_S1_Data', # A folder that will be created in your Google Drive
        region=galati_roi,
        scale=10, # 10-meter resolution (Sentinel-1 standard)
        maxPixels=1e10
    )
    task.start()


def download_to_local(image, filename):
    out_path = os.path.join(output_dir, filename + '.tif')
    print(f"Downloading {filename} directly to {out_path}...")
    
    try:
        # Geemap handles the direct URL request to GEE
        geemap.ee_export_image(
            image, 
            filename=out_path, 
            scale=50, 
            region=galati_roi, 
            file_per_band=False
        )
        print(f"✅ Success: Saved {filename}.tif")
    except Exception as e:
        print(f"❌ Error downloading {filename}: {e}")

# 5. Run the Exports
export_to_drive(pre_vv, 'Galati_Pre_VV')
export_to_drive(pre_vh, 'Galati_Pre_VH')
export_to_drive(post_vv, 'Galati_Post_VV')
export_to_drive(post_vh, 'Galati_Post_VH')

# download_to_local(pre_vv, 'Galati_Pre_VV')
# download_to_local(pre_vh, 'Galati_Pre_VH')
# download_to_local(post_vv, 'Galati_Post_VV')
# download_to_local(post_vh, 'Galati_Post_VH')
