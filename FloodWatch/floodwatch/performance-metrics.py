import geopandas as gpd
from rasterstats import zonal_stats
import pandas as pd
import numpy as np

def evaluate_village_predictions(
    villages_geojson='public/village_limits.geojson',
    prediction_geojson='public/flood_warnings-80.geojson',
    detection_tif='public/Galati_GEE_Flood_Prediction_Final.tif'
):
    print("Începe evaluarea la nivel de UAT/Comună...")

    # 1. Încărcarea datelor
    villages = gpd.read_file(villages_geojson)
    predictions = gpd.read_file(prediction_geojson)

    # Asigură-te că ambele fișiere vectoriale folosesc același sistem de coordonate (WGS84)
    if predictions.crs != villages.crs:
        predictions = predictions.to_crs(villages.crs)

    # Numele coloanei care conține numele satului/comunei (ex: 'name' sau 'NATLEVNAME')
    # Ajustează acest string dacă în geojson-ul tău coloana se numește altfel
    village_name_col = 'name' if 'name' in villages.columns else 'NATLEVNAME'

    # 2. Identificarea comunelor PREZISE ca fiind inundate
    # Facem o intersecție spațială (Spatial Join)
    predicted_intersection = gpd.sjoin(villages, predictions, how='inner', predicate='intersects')
    predicted_villages = set(predicted_intersection[village_name_col].unique())

    # 3. Identificarea comunelor DETECTATE ca fiind inundate de modelul AI (SAR)
    # Folosim zonal_stats pentru a număra câți pixeli inundați (valoare 1) sunt în fiecare comună
    print("Calculăm suprapunerea rasterului AI peste comune...")
    stats = zonal_stats(villages, detection_tif, stats="sum", nodata=0)
    
    # Adăugăm rezultatele înapoi în dataframe-ul comunelor
    villages['flooded_pixels'] = [s['sum'] if s['sum'] else 0 for s in stats]
    
    # Considerăm o comună "Detectată" dacă are cel puțin 10 pixeli inundați (pentru a elimina zgomotul de fond/fals pozitive izolate)
    PIXEL_THRESHOLD = 10
    detected_villages = set(villages[villages['flooded_pixels'] > PIXEL_THRESHOLD][village_name_col])

    # 4. Calculul Metricilor (Matricea de Confuzie la nivel de sat/comună)
    all_villages = set(villages[village_name_col])
    
    true_positives = predicted_villages.intersection(detected_villages)
    false_positives = predicted_villages.difference(detected_villages)
    false_negatives = detected_villages.difference(predicted_villages)
    true_negatives = all_villages.difference(predicted_villages).difference(detected_villages)

    # 5. Generarea Raportului
    print("\n" + "="*50)
    print("📊 RAPORT DE EVALUARE LA NIVEL ADMINISTRATIV (GALAȚI)")
    print("="*50)
    
    print(f"Total comune analizate: {len(all_villages)}")
    print(f"Comune PREZISE cu inundații (AHP): {len(predicted_villages)}")
    print(f"Comune DETECTATE cu inundații (AI): {len(detected_villages)}\n")
    
    print(f"✅ PREDICȚII EXACTE (True Positives): {len(true_positives)}")
    if true_positives:
        print(f"   -> {', '.join(true_positives)}")
        
    print(f"\n⚠️ ALARME FALSE (Prezise, dar nedetectate - False Positives): {len(false_positives)}")
    if false_positives:
        print(f"   -> {', '.join(false_positives)}")
        
    print(f"\n❌ INUNDAȚII RATATE (Detectate, dar neprezise - False Negatives): {len(false_negatives)}")
    if false_negatives:
        print(f"   -> {', '.join(false_negatives)}")
        
    print(f"\n🛡️ LOCALITĂȚI SIGURE (Corect identificate ca nefiind în pericol): {len(true_negatives)}")

    # Calcul matematic Precision & Recall
    precision = len(true_positives) / (len(true_positives) + len(false_positives)) if (len(true_positives) + len(false_positives)) > 0 else 0
    recall = len(true_positives) / (len(true_positives) + len(false_negatives)) if (len(true_positives) + len(false_negatives)) > 0 else 0
    
    print("\n" + "-"*50)
    print(f"Precizia Predicției (Precision): {precision*100:.2f}% (Cât la sută din alarme au fost reale)")
    print(f"Rata de Acoperire (Recall): {recall*100:.2f}% (Cât la sută din satele inundate au fost prezise)")
    print("-"*50)

if __name__ == "__main__":
    evaluate_village_predictions()