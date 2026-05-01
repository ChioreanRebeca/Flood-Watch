import rasterio
import numpy as np

def convert_db_to_linear(input_path, output_path):
    with rasterio.open(input_path) as src:
        data = src.read(1)
        # Formula: Linear = 10^(dB / 10)
        linear_data = 10 ** (data / 10)
        
        meta = src.meta
        meta.update(dtype='float32')
        
        with rasterio.open(output_path, 'w', **meta) as dst:
            dst.write(linear_data.astype('float32'), 1)
    print(f"Converted {input_path} to Linear scale.")

# Do this for all 4 files
convert_db_to_linear('data/Galati_Pre_VV.tif', 'data/Galati_Pre_VV_linear.tif')
convert_db_to_linear('data/Galati_Pre_VH.tif', 'data/Galati_Pre_VH_linear.tif')
convert_db_to_linear('data/Galati_Post_VV.tif', 'data/Galati_Post_VV_linear.tif')
convert_db_to_linear('data/Galati_Post_VH.tif', 'data/Galati_Post_VH_linear.tif')