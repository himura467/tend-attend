"""Configuration dataclasses for multimodal TimesFM on LiT! dataset."""

from .model import ModelConfig
from .training import TrainingConfig

__all__ = [
    "ModelConfig",
    "TrainingConfig",
]
