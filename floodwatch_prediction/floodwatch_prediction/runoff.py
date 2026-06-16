import ee


CN_TABLE = {
    111: [98, 98, 98, 98],
    112: [61, 75, 83, 87],
    121: [81, 88, 91, 93],
    122: [98, 98, 98, 98],
    123: [81, 88, 91, 93],
    124: [89, 92, 94, 95],
    131: [77, 86, 91, 94],
    132: [77, 86, 91, 94],
    133: [77, 86, 91, 94],
    141: [39, 61, 74, 80],
    142: [49, 69, 79, 84],
    211: [67, 78, 85, 89],
    212: [67, 78, 85, 89],
    213: [67, 78, 85, 89],
    221: [64, 75, 82, 85],
    222: [43, 65, 76, 82],
    223: [43, 65, 76, 82],
    231: [39, 61, 74, 80],
    241: [67, 78, 85, 89],
    242: [67, 78, 85, 89],
    243: [58, 72, 81, 85],
    244: [43, 65, 76, 82],
    311: [30, 55, 70, 77],
    312: [30, 55, 70, 77],
    313: [30, 55, 70, 77],
    321: [39, 61, 74, 80],
    322: [35, 56, 70, 77],
    323: [35, 56, 70, 77],
    324: [48, 67, 77, 83],
    331: [77, 86, 91, 94],
    332: [77, 86, 91, 94],
    333: [63, 77, 85, 88],
    334: [77, 86, 91, 94],
    335: [98, 98, 98, 98],
    411: [98, 98, 98, 98],
    412: [98, 98, 98, 98],
    421: [98, 98, 98, 98],
    422: [98, 98, 98, 98],
    423: [98, 98, 98, 98],
    511: [100, 100, 100, 100],
    512: [100, 100, 100, 100],
    521: [100, 100, 100, 100],
    522: [100, 100, 100, 100],
    523: [100, 100, 100, 100],
}


def calculate_runoff_q(precipitation: ee.Image, curve_number: ee.Image) -> ee.Image:

    storage = ee.Image(25400).divide(curve_number).subtract(254)
    initial_abstraction = storage.multiply(0.05)

    runoff_mask = precipitation.gt(initial_abstraction)
    numerator = precipitation.subtract(initial_abstraction).pow(2)
    denominator = precipitation.add(storage.multiply(0.95))

    return (
        numerator
        .divide(denominator)
        .where(runoff_mask.Not(), 0)
        .rename("Runoff_Q")
    )


def get_hsg_with_hand_override(aoi: ee.Geometry, hysg_asset_id: str) -> ee.Image:
    """Loads HYSOGs250m and overrides low-HAND floodplain pixels to HSG D."""
    hsg = ee.Image(hysg_asset_id).select("b1").clip(aoi)
    hand = ee.Image("MERIT/Hydro/v1_0_1").select("hnd").clip(aoi)

    hsg_normalized = (
        hsg
        .where(hsg.eq(11), 1)
        .where(hsg.eq(12), 2)
        .where(hsg.eq(13), 3)
        .where(hsg.eq(14), 4)
    )

    return hsg_normalized.where(hand.lt(2), 4).rename("HSG_Overridden")


def map_curve_number(
    hsg_image: ee.Image,
    amc_image: ee.Image,
    corine_image: ee.Image,
) -> ee.Image:
    """Maps CORINE + HSG to Curve Number and adjusts it by AMC class."""
    codes = list(CN_TABLE.keys())

    cn_a = corine_image.remap(codes, [CN_TABLE[k][0] for k in codes]).rename("CN")
    cn_b = corine_image.remap(codes, [CN_TABLE[k][1] for k in codes]).rename("CN")
    cn_c = corine_image.remap(codes, [CN_TABLE[k][2] for k in codes]).rename("CN")
    cn_d = corine_image.remap(codes, [CN_TABLE[k][3] for k in codes]).rename("CN")

    cn_amc2 = (
        cn_a
        .where(hsg_image.eq(2), cn_b)
        .where(hsg_image.eq(3), cn_c)
        .where(hsg_image.eq(4), cn_d)
    )

    cn_amc1 = cn_amc2.multiply(4.2).divide(
        ee.Image(10).subtract(cn_amc2.multiply(0.058))
    )
    cn_amc3 = cn_amc2.multiply(23).divide(
        ee.Image(10).add(cn_amc2.multiply(0.13))
    )

    return (
        cn_amc2
        .where(amc_image.eq(1), cn_amc1)
        .where(amc_image.eq(3), cn_amc3)
        .rename("Dynamic_CN")
    )


def load_corine_land_cover(aoi: ee.Geometry) -> ee.Image:
    return ee.Image("COPERNICUS/CORINE/V20/100m/2018").select("landcover").clip(aoi)
