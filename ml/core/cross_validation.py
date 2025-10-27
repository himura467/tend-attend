"""Cross-validation utilities for LiT! dataset.

This module provides LiT!-specific wrappers around the core cross-validation utilities.
"""

from pathlib import Path
from typing import Any

from multimodal_timesfm.cross_validation import (
    create_fold_datasets as create_fold_datasets_core,
)
from multimodal_timesfm.cross_validation import (
    get_cross_validation_splits as get_cross_validation_splits_core,
)
from torch.utils.data import ConcatDataset, Dataset

from core.lit_dataset import LitDataset


def _lit_dataset_factory(
    data_path: Path,
    entity: str,
    patch_len: int,
    context_len: int,
    horizon_len: int,
    **kwargs: Any,
) -> Dataset[dict[str, Any]]:
    """Factory function to create LiT! dataset for a single entity.

    Args:
        data_path: Root directory containing LiT! dataset.
        entity: Entity name.
        patch_len: Length of input patches.
        context_len: Length of context window.
        horizon_len: Length of forecasting horizon.
        **kwargs: Additional keyword arguments (unused for LiT!).

    Returns:
        LiT! dataset instance for the specified entity.
    """
    return LitDataset(
        data_dir=data_path,
        entity=entity,
        split_ratio=1.0,  # Use all data from each entity in CV mode
        split="train",
        patch_len=patch_len,
        context_len=context_len,
        horizon_len=horizon_len,
    )


def get_all_entities(data_path: Path) -> list[str]:
    """Get all available entities from the LiT! dataset.

    Args:
        data_path: Root directory containing LiT! dataset.

    Returns:
        List of entity names.
    """
    numerical_dir = data_path / "numerical"
    if not numerical_dir.exists():
        raise FileNotFoundError(f"Numerical data directory not found: {numerical_dir}")

    entities = []
    for csv_file in numerical_dir.glob("*.csv"):
        entity_name = csv_file.stem
        entities.append(entity_name)

    entities.sort()  # Sort for consistency
    return entities


def get_cross_validation_splits(
    all_entities: list[str],
    n_folds: int,
    train_ratio: float,
    val_ratio: float,
    test_ratio: float,
    seed: int | None = None,
) -> list[tuple[list[str], list[str], list[str]]]:
    """Generate cross-validation splits for LiT! dataset.

    Args:
        all_entities: List of all entity names.
        n_folds: Number of folds for cross-validation.
        train_ratio: Proportion of entities for training.
        val_ratio: Proportion of entities for validation.
        test_ratio: Proportion of entities for testing.
        seed: Random seed for reproducibility.

    Returns:
        List of tuples, each containing (train_entities, val_entities, test_entities) for a fold.
    """
    return get_cross_validation_splits_core(
        all_entities=all_entities,
        n_folds=n_folds,
        train_ratio=train_ratio,
        val_ratio=val_ratio,
        test_ratio=test_ratio,
        seed=seed,
    )


def create_fold_datasets(
    data_path: Path,
    train_entities: list[str],
    val_entities: list[str],
    test_entities: list[str],
    patch_len: int,
    context_len: int,
    horizon_len: int,
) -> tuple[ConcatDataset[dict[str, Any]], ConcatDataset[dict[str, Any]], ConcatDataset[dict[str, Any]]]:
    """Create datasets for a single fold.

    Args:
        data_path: Root directory containing LiT! dataset.
        train_entities: List of entity names for training.
        val_entities: List of entity names for validation.
        test_entities: List of entity names for testing.
        patch_len: Length of input patches.
        context_len: Length of context window.
        horizon_len: Length of forecasting horizon.

    Returns:
        Tuple of (train_dataset, val_dataset, test_dataset).
    """
    return create_fold_datasets_core(
        data_path=data_path,
        train_entities=train_entities,
        val_entities=val_entities,
        test_entities=test_entities,
        dataset_factory=_lit_dataset_factory,
        patch_len=patch_len,
        context_len=context_len,
        horizon_len=horizon_len,
    )
