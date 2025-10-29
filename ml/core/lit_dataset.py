"""LiT! dataset loader for multimodal time series forecasting."""

from pathlib import Path
from typing import Literal

import numpy as np
import pandas as pd
from multimodal_timesfm.multimodal_dataset import MultimodalDatasetBase


class LitDataset(MultimodalDatasetBase):
    """Dataset loader for LiT! dataset with time series and text data.

    This class loads multimodal time series data from the LiT! dataset structure,
    which contains numerical time series data and corresponding textual information
    for individual entities.

    Expected directory structure:
        data_dir/
        ├── numerical/
        │   ├── entity1.csv
        │   ├── entity2.csv
        │   └── ...
        └── textual/
            ├── entity1.csv
            ├── entity2.csv
            └── ...
    """

    def __init__(
        self,
        data_dir: Path,
        entity: str,
        split_ratio: float = 0.8,
        split: Literal["train", "test"] = "train",
        patch_len: int = 32,
        context_len: int = 128,
        horizon_len: int = 32,
    ) -> None:
        """Initializes LiT! dataset loader.

        Args:
            data_dir: Root directory containing LiT! dataset.
            entity: Entity name (e.g., 'friday_online_Nioka').
            split_ratio: Train/test split ratio (default 0.8 for 80% train).
            split: Dataset split ('train' or 'test').
            patch_len: Length of input patches for temporal alignment with time series data.
            context_len: Length of context window for input sequences.
                        context_len must be an integer multiple of patch_len.
            horizon_len: Length of forecasting horizon.
                        horizon_len must be an integer multiple of patch_len.
        """
        self.entity = entity
        super().__init__(data_dir, split_ratio, split, patch_len, context_len, horizon_len)

    def _load_data(self) -> None:
        """Loads LiT! dataset from files."""
        numerical_file = self.data_dir / "numerical" / f"{self.entity}.csv"
        textual_file = self.data_dir / "textual" / f"{self.entity}.csv"

        if not numerical_file.exists():
            raise FileNotFoundError(f"Numerical data file not found: {numerical_file}")

        # Load numerical time series data
        numerical_df = pd.read_csv(numerical_file)

        # Sort numerical_df by start_date to ensure chronological order
        if "start_date" in numerical_df.columns:
            numerical_df = numerical_df.sort_values("start_date").reset_index(drop=True)

        # Load textual data if available
        textual_data = {}
        if textual_file.exists():
            textual_data["tms"] = pd.read_csv(textual_file)

        self._process_data(numerical_df, textual_data)

    def _process_data(self, numerical_df: pd.DataFrame, textual_data: dict[str, pd.DataFrame]) -> None:
        """Processes loaded dataframes into internal format.

        Args:
            numerical_df: Dataframe containing numerical time series data.
            textual_data: Dictionary containing textual dataframes (tms).
        """
        if "start_date" not in numerical_df.columns:
            raise ValueError("No start_date column found in numerical data")
        if "end_date" not in numerical_df.columns:
            raise ValueError("No end_date column found in numerical data")

        full_start_dates = numerical_df["start_date"]
        full_end_dates = numerical_df["end_date"]

        # Process each numeric column as a separate univariate time series
        numeric_cols = ["attended_at", "left_at"]

        for column in numeric_cols:
            # Extract time series from this column
            time_series_values = numerical_df[column].to_numpy()

            # Split data based on split_ratio
            split_idx = int(len(time_series_values) * self.split_ratio)

            if self.split == "train":
                ts_data = time_series_values[:split_idx]
                start_dates = full_start_dates.iloc[:split_idx]
                end_dates = full_end_dates.iloc[:split_idx]
            else:  # test
                ts_data = time_series_values[split_idx:]
                start_dates = full_start_dates.iloc[split_idx:]
                end_dates = full_end_dates.iloc[split_idx:]

            # Skip if insufficient data after split
            if len(ts_data) < self.context_len + self.horizon_len:
                continue

            # Create windowed samples from this univariate time series
            for start_idx in range(
                0,
                len(ts_data) - self.context_len - self.horizon_len + 1,
                self.horizon_len,
            ):
                # Extract context
                context_end = start_idx + self.context_len
                context = ts_data[start_idx:context_end].reshape(-1, 1)

                # Extract future
                future_end = context_end + self.horizon_len
                future = ts_data[context_end:future_end].reshape(-1, 1)

                # Get associated text for this context
                window_start_date = str(start_dates.iloc[start_idx])
                window_end_date = str(end_dates.iloc[context_end - 1])

                # Calculate frequency based on interval between start_date values
                freq = self._calculate_frequency_for_sample(start_dates, start_idx, context_end)

                # Calculate number of text patches based on context_len / patch_len
                text_patches_num = self.context_len // self.patch_len

                patched_texts = self._get_patched_texts_for_period(
                    window_start_date, window_end_date, textual_data, text_patches_num
                )

                sample = {
                    "context": context.astype(np.float32),
                    "future": future.astype(np.float32),
                    "freq": freq,
                    "patched_texts": patched_texts,
                    "metadata": {
                        "entity": self.entity,
                        "column": column,
                        "start_index": start_idx,
                    },
                }
                self.data.append(sample)

    def _calculate_frequency_for_sample(self, dates: pd.Series, start_idx: int, end_idx: int) -> int:
        """Calculate frequency value based on interval between date values.

        Args:
            dates: Series of dates for the time series.
            start_idx: Starting index of the sample.
            end_idx: Ending index of the sample.

        Returns:
            Frequency value:
            - 0 for daily or lower granularity
            - 1 for weekly or monthly granularity
            - 2 for quarterly or higher granularity
        """
        if end_idx - start_idx < 1:
            return 0  # Default to daily if insufficient data

        # Convert to datetime and calculate intervals for the entire sample range
        sample_dates = pd.to_datetime(dates.iloc[start_idx:end_idx])
        intervals = sample_dates.diff().dropna()

        if len(intervals) == 0:
            return 0  # Default to daily

        # Calculate average interval across all data points in the sample
        avg_interval = intervals.mean()
        avg_days = pd.Timedelta(avg_interval).total_seconds() / (24 * 3600)  # Convert to days

        # Classify based on average interval
        if avg_days < 3:
            return 0
        elif avg_days < 35:  # Weekly to monthly (up to ~5 weeks)
            return 1
        else:  # Quarterly or higher
            return 2

    def _get_patched_texts_for_period(
        self,
        start_date: str,
        end_date: str,
        textual_data: dict[str, pd.DataFrame],
        text_patches_num: int,
    ) -> list[list[str]]:
        """Gets patched textual descriptions for a specific time period.

        Args:
            start_date: Start date of the time period (YYYY-MM-DD format).
            end_date: End date of the time period (YYYY-MM-DD format).
            textual_data: Dictionary containing textual dataframes.
            text_patches_num: Number of text patches to generate for this period.

        Returns:
            List of lists where each inner list contains text data for one patch period.
            Returns text_patches_num number of lists.
        """
        # Convert dates to pandas datetime for comparison
        period_start = pd.to_datetime(start_date)
        period_end = pd.to_datetime(end_date)

        # Divide the time period into equal parts
        period_duration = period_end - period_start
        patch_duration = period_duration / text_patches_num

        patches = []

        for i in range(text_patches_num):
            # Calculate patch time boundaries
            patch_start = period_start + i * patch_duration
            patch_end = period_start + (i + 1) * patch_duration

            patch_texts = []

            # Get text that overlaps with this patch period
            if "tms" in textual_data:
                tms_df = textual_data["tms"]
                if "start_date" in tms_df.columns and "end_date" in tms_df.columns:
                    tms_df = tms_df.copy()
                    tms_df["start_date"] = pd.to_datetime(tms_df["start_date"])
                    tms_df["end_date"] = pd.to_datetime(tms_df["end_date"])

                    matching_tms = tms_df[(tms_df["start_date"] <= patch_end) & (tms_df["end_date"] >= patch_start)]

                    for _, row in matching_tms.iterrows():
                        if "tms" in tms_df.columns and pd.notna(row["tms"]) and str(row["tms"]).strip() != "":
                            patch_texts.append(str(row["tms"]))

            patches.append(patch_texts)

        return patches
