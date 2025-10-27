"""Training configuration dataclasses for multimodal TimesFM on LiT! dataset."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from multimodal_timesfm.cross_validation import CrossValidationConfig
from multimodal_timesfm.utils.yaml import load_yaml


@dataclass
class RunnerConfig:
    batch_size: int = 8
    gradient_accumulation_steps: int = 4
    max_grad_norm: float = 1.0
    learning_rate: float = 1e-4
    weight_decay: float = 0.01
    num_epochs: int = 10
    wandb_run_name: str = "multimodal-timesfm-lit"


@dataclass
class HardwareConfig:
    device: str | None = None


@dataclass
class DataConfig:
    data_path: str = "data/lit"
    train_entities: list[str] = field(
        default_factory=lambda: [
            "friday_online_Nioka",
            "friday_online_Raho",
            "friday_online_YUTA",
            "friday_online_gyunu",
            "friday_online_kiip",
            "friday_online_supermochi",
            "friday_online_あお",
            "friday_online_あめ",
            "friday_online_いくま",
            "friday_online_いとはや",
            "friday_online_えもん",
            "friday_online_おひたし",
            "friday_online_かえで",
            "friday_online_かげまる",
            "friday_online_かずや",
            "friday_online_くろな",
            "friday_online_こじたく",
            "friday_online_さき",
            "friday_online_さや",
            "friday_online_さら",
            "friday_online_すわっち",
            "friday_online_せいや",
            "friday_online_そらと",
            "friday_online_たっくん",
            "friday_online_ちょあ",
            "friday_online_とっきー",
            "friday_online_とら",
            "friday_online_はる",
            "friday_online_はるさめ",
            "friday_online_ひまね",
            "friday_online_ふうた",
            "friday_online_まぴゆ",
            "friday_online_まーぼー",
            "friday_online_みう",
            "friday_online_みけねこ",
            "friday_online_みやの",
            "friday_online_やすむー",
            "friday_online_アルドラ",
            "friday_online_コンポタ",
            "friday_online_サーニャ",
            "friday_online_タカ",
            "friday_online_ミラト",
            "friday_online_（スペース）君",
        ]
    )
    test_entities: list[str] = field(
        default_factory=lambda: [
            "friday_online_ゆいゆ",
            "friday_online_ゆうたろー",
            "friday_online_ゆずみかん",
            "friday_online_よしぃぃ",
            "friday_online_よつろん",
        ]
    )
    patch_len: int = 32
    context_len: int = 32
    horizon_len: int = 128


@dataclass
class LogConfig:
    save_dir: str = "logs"
    experiment_name: str = "multimodal_timesfm_lit"


@dataclass
class CheckpointConfig:
    save_dir: str = "checkpoints"
    save_frequency: int = 10


@dataclass
class TrainingConfig:
    runner: RunnerConfig = field(default_factory=RunnerConfig)
    hardware: HardwareConfig = field(default_factory=HardwareConfig)
    data: DataConfig = field(default_factory=DataConfig)
    log: LogConfig = field(default_factory=LogConfig)
    checkpoint: CheckpointConfig = field(default_factory=CheckpointConfig)
    cross_validation: CrossValidationConfig = field(default_factory=CrossValidationConfig)

    @classmethod
    def from_yaml(cls, yaml_path: Path) -> TrainingConfig:
        config_dict = load_yaml(yaml_path)
        return cls(
            runner=RunnerConfig(**config_dict.get("runner", {})),
            hardware=HardwareConfig(**config_dict.get("hardware", {})),
            data=DataConfig(**config_dict.get("data", {})),
            log=LogConfig(**config_dict.get("log", {})),
            checkpoint=CheckpointConfig(**config_dict.get("checkpoint", {})),
            cross_validation=CrossValidationConfig(**config_dict.get("cross_validation", {})),
        )
