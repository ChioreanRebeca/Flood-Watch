import rasterio
from rasterio.plot import show
import matplotlib.pyplot as plt
import numpy as np

# Path to your final prediction
file_path = r"output\Galati_GEE_Flood_Prediction_Final.tif"



with rasterio.open(file_path) as src:
    # Read the data
    flood_mask = src.read(1)
    
    # Create the figure
    plt.figure(figsize=(10, 10))
    
    # Use a 'mask' to make the 0s (no water) transparent or black
    # and 255s (flood) a bright color like Cyan or Blue
    plt.title("AI Flood Detection Result: Galați (Sept 2024)")
    
    # cmap='Blues' makes water blue, background white/light
    # If you want black background, use cmap='gray'
    img = plt.imshow(flood_mask, cmap='Blues')
    plt.colorbar(img, label="Flood Probability/Mask")
    
    print(f"Unique values in output: {np.unique(flood_mask)}")
    print(f"Mean value: {np.mean(flood_mask)}")
    print(f"Max value: {np.max(flood_mask)}")
    plt.show()