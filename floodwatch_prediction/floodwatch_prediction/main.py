import argparse
from pathlib import Path

from .config import FloodPredictionConfig
from .pipeline import run_prediction


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run the FloodWatch prediction module and export warning points as GeoJSON."
    )

    parser.add_argument("--config", type=str, help="Path to YAML config file.")
    parser.add_argument("--authenticate", action="store_true", help="Run ee.Authenticate() before initializing.")

    parser.add_argument("--project-id", type=str)
    parser.add_argument("--city-name", type=str)
    parser.add_argument("--address-type", type=str)
    parser.add_argument("--today-date", type=str)
    parser.add_argument("--hysg-asset-id", type=str)
    parser.add_argument("--output", type=str, help="Output GeoJSON path.")
    parser.add_argument("--risk-threshold", type=float)

    return parser.parse_args()


def build_config(args: argparse.Namespace) -> FloodPredictionConfig:
    if args.config:
        config = FloodPredictionConfig.from_yaml(args.config)
    else:
        if not args.project_id:
            raise ValueError("Either --config or --project-id must be provided.")
        config = FloodPredictionConfig(project_id=args.project_id)

    if args.project_id:
        config.project_id = args.project_id
    if args.city_name:
        config.city_name = args.city_name
    if args.address_type:
        config.address_type = args.address_type
    if args.today_date:
        config.today_date = args.today_date
    if args.hysg_asset_id:
        config.hysg_asset_id = args.hysg_asset_id
    if args.output:
        config.output_geojson = args.output
    if args.risk_threshold is not None:
        config.risk_threshold = args.risk_threshold

    return config


def main() -> None:
    args = parse_args()
    config = build_config(args)
    metadata = run_prediction(config, authenticate=args.authenticate)

    print("FloodWatch prediction completed.")
    print(f"GeoJSON: {metadata['output_geojson']}")
    print(f"Metadata: {config.metadata_json}")


if __name__ == "__main__":
    main()
