import argparse
import json
import logging
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

import yaml


def setup_logging(log_dir: Path) -> None:
    log_dir.mkdir(parents=True, exist_ok=True)

    log_file = log_dir / "floodwatch_orchestrator.log"

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )


def load_config(config_path: Path) -> dict:
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with config_path.open("r", encoding="utf-8") as file:
        return yaml.safe_load(file)


def run_command(command: list[str], working_dir: Path, step_name: str) -> None:
    logging.info("Starting step: %s", step_name)
    logging.info("Working directory: %s", working_dir)
    logging.info("Command: %s", " ".join(command))

    if not working_dir.exists():
        raise FileNotFoundError(f"Working directory not found: {working_dir}")

    result = subprocess.run(
        command,
        cwd=str(working_dir),
        text=True,
        capture_output=True,
        shell=False,
    )

    if result.stdout:
        logging.info("[%s stdout]\n%s", step_name, result.stdout)

    if result.stderr:
        logging.warning("[%s stderr]\n%s", step_name, result.stderr)

    if result.returncode != 0:
        raise RuntimeError(
            f"Step failed: {step_name}. Return code: {result.returncode}"
        )

    logging.info("Finished step: %s", step_name)


def write_status(public_dir: Path, status: dict) -> None:
    public_dir.mkdir(parents=True, exist_ok=True)

    status_path = public_dir / "system_status.json"

    with status_path.open("w", encoding="utf-8") as file:
        json.dump(status, file, indent=2)

    logging.info("System status written to: %s", status_path)


def read_geojson_features(geojson_path: Path) -> list[dict]:
    if not geojson_path.exists():
        logging.warning("GeoJSON file not found: %s", geojson_path)
        return []

    with geojson_path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    return data.get("features", [])


def get_max_numeric_risk(features: list[dict]) -> float:
    possible_keys = [
        "risk",
        "risk_score",
        "score",
        "flood_risk",
        "probability",
        "prediction",
        "value",
    ]

    max_risk = 0.0

    for feature in features:
        properties = feature.get("properties", {})

        for key in possible_keys:
            value = properties.get(key)

            if isinstance(value, (int, float)):
                max_risk = max(max_risk, float(value))

            if isinstance(value, str):
                try:
                    max_risk = max(max_risk, float(value))
                except ValueError:
                    pass

    return max_risk


def get_detected_severities(features: list[dict]) -> set[str]:
    severity_keys = [
        "severity",
        "risk_level",
        "level",
        "category",
        "class",
    ]

    severities = set()

    for feature in features:
        properties = feature.get("properties", {})

        for key in severity_keys:
            value = properties.get(key)

            if isinstance(value, str):
                severities.add(value.strip().upper())

    return severities


def should_run_detection(config: dict, features: list[dict]) -> tuple[bool, str]:
    mode = config["mode"]["detection_mode"].lower()
    risk_threshold = float(config["prediction"]["risk_threshold"])

    feature_count = len(features)
    max_risk = get_max_numeric_risk(features)
    detected_severities = get_detected_severities(features)

    trigger_severities = {
        severity.upper()
        for severity in config["detection"].get("trigger_severities", [])
    }

    if feature_count == 0:
        return False, "No flood warning points were generated."

    if mode == "default":
        return True, "Default mode: detection runs for every predicted incident."

    if mode == "resource_efficient":
        severity_match = bool(detected_severities.intersection(trigger_severities))
        risk_match = max_risk >= risk_threshold

        if severity_match or risk_match:
            return (
                True,
                f"Resource efficient mode: detection triggered. "
                f"Max risk={max_risk}, severities={list(detected_severities)}",
            )

        return (
            False,
            f"Resource efficient mode: detection skipped. "
            f"Max risk={max_risk}, severities={list(detected_severities)}",
        )

    raise ValueError(
        "Invalid detection_mode. Use 'default' or 'resource_efficient'."
    )


def run_prediction(config: dict) -> None:
    prediction_dir = Path(config["paths"]["prediction_working_dir"])

    python_executable = config["prediction"]["python_executable"]
    module_command = config["prediction"]["module_command"]
    config_file = config["prediction"]["config_file"]
    output_geojson = config["prediction"]["output_geojson"]

    command = [
        python_executable,
        "-m",
        module_command,
        "--config",
        config_file,
        "--output",
        output_geojson,
    ]

    run_command(command, prediction_dir, "Hydrological prediction module")


def run_get_data(config: dict) -> None:
    if not config["detection"].get("run_get_data_before_detection", False):
        logging.info("Skipping get_data.py because it is disabled in config.")
        return

    ai4g_dir = Path(config["paths"]["ai4g_working_dir"])
    python_executable = config["detection"]["python_executable"]
    get_data_script = config["detection"]["get_data_script"]

    command = [
        python_executable,
        get_data_script,
    ]

    run_command(command, ai4g_dir, "Sentinel data download script")


def run_detection(config: dict) -> None:
    ai4g_dir = Path(config["paths"]["ai4g_working_dir"])

    detection_config = config["detection"]

    command = [
        detection_config["python_executable"],
        detection_config["detection_script"],
        "--pre_vv",
        detection_config["pre_vv"],
        "--pre_vh",
        detection_config["pre_vh"],
        "--post_vv",
        detection_config["post_vv"],
        "--post_vh",
        detection_config["post_vh"],
        "--model_path",
        detection_config["model_path"],
        "--output_dir",
        detection_config["output_dir"],
        "--output_name",
        detection_config["output_name"],
    ]

    run_command(command, ai4g_dir, "AI flood detection module")


def copy_output_if_needed(source_path: Path, destination_dir: Path) -> None:
    destination_dir.mkdir(parents=True, exist_ok=True)

    if not source_path.exists():
        logging.warning("Output file not found, cannot copy: %s", source_path)
        return

    destination_path = destination_dir / source_path.name

    if source_path.resolve() == destination_path.resolve():
        logging.info("Output already located in React public folder: %s", source_path)
        return

    shutil.copy2(source_path, destination_path)
    logging.info("Copied output to React public folder: %s", destination_path)


def run_pipeline(config: dict) -> None:
    public_dir = Path(config["paths"]["react_public_dir"])
    prediction_geojson = Path(config["prediction"]["output_geojson"])

    status = {
        "service": config["service"]["name"],
        "lastRunStartedAt": datetime.now().isoformat(timespec="seconds"),
        "predictionStatus": "not_started",
        "detectionStatus": "not_started",
        "message": "",
    }

    write_status(public_dir, status)

    try:
        status["predictionStatus"] = "running"
        status["message"] = "Hydrological prediction module is running."
        write_status(public_dir, status)

        run_prediction(config)

        status["predictionStatus"] = "completed"
        status["message"] = "Hydrological prediction module completed."
        write_status(public_dir, status)

        features = read_geojson_features(prediction_geojson)

        run_detection_flag, reason = should_run_detection(config, features)
        logging.info("Detection decision: %s", reason)

        if run_detection_flag:
            status["detectionStatus"] = "running"
            status["message"] = reason
            write_status(public_dir, status)

            run_get_data(config)
            run_detection(config)

            status["detectionStatus"] = "completed"
            status["message"] = "AI flood detection completed."
        else:
            status["detectionStatus"] = "skipped"
            status["message"] = reason

        detection_output = (
            Path(config["detection"]["output_dir"])
            / config["detection"]["output_name"]
        )

        copy_output_if_needed(prediction_geojson, public_dir)
        copy_output_if_needed(detection_output, public_dir)

        status["lastRunFinishedAt"] = datetime.now().isoformat(timespec="seconds")
        write_status(public_dir, status)

        logging.info("FloodWatch pipeline completed successfully.")

    except Exception as error:
        logging.exception("FloodWatch pipeline failed.")

        status["lastRunFinishedAt"] = datetime.now().isoformat(timespec="seconds")
        status["message"] = str(error)

        if status["predictionStatus"] == "running":
            status["predictionStatus"] = "failed"

        if status["detectionStatus"] == "running":
            status["detectionStatus"] = "failed"

        write_status(public_dir, status)


def main() -> None:
    parser = argparse.ArgumentParser(description="FloodWatch Python Orchestrator")
    parser.add_argument(
        "--config",
        default="orchestrator_config.yaml",
        help="Path to orchestrator YAML configuration file.",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run the pipeline once and exit.",
    )

    args = parser.parse_args()

    config_path = Path(args.config)
    config = load_config(config_path)

    setup_logging(Path("logs"))

    interval_hours = float(config["service"]["run_interval_hours"])
    interval_seconds = interval_hours * 60 * 60

    run_once = args.once or bool(config["service"].get("run_once", False))

    logging.info("Starting FloodWatch Orchestrator.")
    logging.info("Run interval: %s hours", interval_hours)

    if run_once:
        run_pipeline(config)
        return

    while True:
        run_pipeline(config)

        logging.info("Sleeping for %s hours.", interval_hours)
        time.sleep(interval_seconds)


if __name__ == "__main__":
    main()