"""Training pipeline for Two-Tower recommendation model."""

import tensorflow as tf
from tensorflow import keras
from typing import Dict, Tuple, Optional
from pathlib import Path
import json


class TrainingConfig:
    """Training configuration."""

    def __init__(
        self,
        mode: str = "DEMO",
        batch_size: int = 32,
        learning_rate: float = 0.001,
        epochs: int = 1,
        checkpoint_dir: str = "checkpoints",
    ):
        """
        Initialize training config.

        Args:
            mode: "DEMO" (1K samples, 1 epoch)
                 "SMALL" (10K samples, 3 epochs)
                 "FULL" (all data, full training)
            batch_size: Batch size for training
            learning_rate: Initial learning rate
            epochs: Number of epochs (overridden by mode)
            checkpoint_dir: Directory for model checkpoints
        """
        self.mode = mode.upper()
        self.batch_size = batch_size
        self.learning_rate = learning_rate
        self.checkpoint_dir = Path(checkpoint_dir)

        # Mode-specific configs
        if self.mode == "DEMO":
            self.num_samples = 1000
            self.epochs = 1
            self.eval_freq = 1  # Evaluate every batch
            self.verbose = True

        elif self.mode == "SMALL":
            self.num_samples = 10000
            self.epochs = 3
            self.eval_freq = 10  # Evaluate every 10 batches
            self.verbose = True

        elif self.mode == "FULL":
            self.num_samples = 1000000  # Placeholder (actual from data)
            self.epochs = 5
            self.eval_freq = 100  # Evaluate every 100 batches
            self.verbose = False

        else:
            raise ValueError(f"Unknown mode: {mode}")

        # Create checkpoint directory
        self.checkpoint_dir.mkdir(exist_ok=True)

    def to_dict(self) -> Dict:
        """Return config as dictionary."""
        return {
            "mode": self.mode,
            "batch_size": self.batch_size,
            "learning_rate": self.learning_rate,
            "epochs": self.epochs,
            "num_samples": self.num_samples,
            "eval_freq": self.eval_freq,
        }


class TrainingPipeline:
    """Training pipeline for Two-Tower model."""

    def __init__(
        self,
        model: keras.Model,
        loss_fn,
        config: TrainingConfig,
    ):
        """
        Initialize training pipeline.

        Args:
            model: Integrated Two-Tower model
            loss_fn: Loss function (NegativeSamplingLoss)
            config: TrainingConfig object
        """
        self.model = model
        self.loss_fn = loss_fn
        self.config = config

        # Optimizer with learning rate schedule
        self.optimizer = keras.optimizers.Adam(learning_rate=config.learning_rate)

        # Metrics
        self.train_loss_metric = keras.metrics.Mean(name="train_loss")
        self.val_loss_metric = keras.metrics.Mean(name="val_loss")

        # History
        self.history = {
            "loss": [],
            "val_loss": [],
            "learning_rate": [],
        }

        # Checkpointing
        self.best_val_loss = float("inf")
        self.checkpoint_counter = 0

    def train_step(
        self,
        user_features: tf.Tensor,
        item_features: tf.Tensor,
        context_features: tf.Tensor,
        positive_indices: tf.Tensor,
        candidate_embeddings: tf.Tensor,
    ) -> tf.Tensor:
        """
        Single training step.

        Args:
            user_features: User embeddings (batch_size, 52)
            item_features: Item embeddings (batch_size, 44)
            context_features: Context embeddings (batch_size, 34)
            positive_indices: Positive candidate indices (batch_size,)
            candidate_embeddings: All candidate embeddings (num_candidates, 32)

        Returns:
            Loss scalar
        """
        with tf.GradientTape() as tape:
            # Forward pass
            output = self.model(
                user_features, item_features, context_features, training=True
            )

            # Compute loss
            loss = self.loss_fn.compute_loss(
                output["query_embedding"],
                candidate_embeddings,
                positive_indices,
                temperature=0.1,
            )

        # Backward pass
        gradients = tape.gradient(loss, self.model.trainable_variables)
        self.optimizer.apply_gradients(
            zip(gradients, self.model.trainable_variables)
        )

        return loss

    def eval_step(
        self,
        user_features: tf.Tensor,
        item_features: tf.Tensor,
        context_features: tf.Tensor,
        positive_indices: tf.Tensor,
        candidate_embeddings: tf.Tensor,
    ) -> tf.Tensor:
        """
        Single evaluation step (no gradients).

        Args:
            Same as train_step

        Returns:
            Loss scalar
        """
        output = self.model(
            user_features, item_features, context_features, training=False
        )

        loss = self.loss_fn.compute_loss(
            output["query_embedding"],
            candidate_embeddings,
            positive_indices,
            temperature=0.1,
        )

        return loss

    def save_checkpoint(self, epoch: int, is_best: bool = False):
        """
        Save model checkpoint.

        Args:
            epoch: Current epoch number
            is_best: Whether this is the best model so far
        """
        if is_best:
            checkpoint_path = (
                self.config.checkpoint_dir / f"best_model_epoch_{epoch}.weights.h5"
            )
        else:
            checkpoint_path = (
                self.config.checkpoint_dir / f"checkpoint_epoch_{epoch}.weights.h5"
            )

        self.model.save_weights(str(checkpoint_path))

        if self.config.verbose:
            print(f"✅ Checkpoint saved: {checkpoint_path}")

    def save_history(self):
        """Save training history."""
        history_path = self.config.checkpoint_dir / "training_history.json"
        with open(history_path, "w") as f:
            json.dump(self.history, f, indent=2)

        if self.config.verbose:
            print(f"✅ History saved: {history_path}")

    def train(
        self,
        train_dataset,
        val_dataset,
        verbose: bool = True,
    ):
        """
        Full training loop.

        Args:
            train_dataset: Training data generator
            val_dataset: Validation data generator
            verbose: Print progress
        """
        print(f"\n{'='*60}")
        print(f"🚀 Starting Training: {self.config.mode} Mode")
        print(f"{'='*60}")
        print(f"Config: {self.config.to_dict()}\n")

        for epoch in range(self.config.epochs):
            print(f"\n📊 Epoch {epoch + 1}/{self.config.epochs}")

            # Training loop
            batch_num = 0
            for batch_data in train_dataset:
                user_feat, item_feat, context_feat, pos_idx, cand_emb = batch_data

                loss = self.train_step(
                    user_feat, item_feat, context_feat, pos_idx, cand_emb
                )
                self.train_loss_metric.update_state(loss)

                batch_num += 1

                # Periodic evaluation
                if batch_num % self.config.eval_freq == 0:
                    for val_batch in val_dataset:
                        val_user, val_item, val_ctx, val_pos, val_cand = val_batch
                        val_loss = self.eval_step(
                            val_user, val_item, val_ctx, val_pos, val_cand
                        )
                        self.val_loss_metric.update_state(val_loss)

                    if verbose and self.config.verbose:
                        print(
                            f"  Batch {batch_num}: "
                            f"loss={self.train_loss_metric.result():.4f}, "
                            f"val_loss={self.val_loss_metric.result():.4f}"
                        )

            # End of epoch
            epoch_loss = float(self.train_loss_metric.result())
            epoch_val_loss = float(self.val_loss_metric.result())

            self.history["loss"].append(epoch_loss)
            self.history["val_loss"].append(epoch_val_loss)
            self.history["learning_rate"].append(
                float(self.optimizer.learning_rate.numpy())
            )

            print(f"  Loss: {epoch_loss:.4f}, Val Loss: {epoch_val_loss:.4f}")

            # Checkpointing
            is_best = epoch_val_loss < self.best_val_loss
            if is_best:
                self.best_val_loss = epoch_val_loss
                self.save_checkpoint(epoch, is_best=True)

            self.train_loss_metric.reset_state()
            self.val_loss_metric.reset_state()

        # Save final history
        self.save_history()

        print(f"\n{'='*60}")
        print(f"✅ Training Complete!")
        print(f"Best Val Loss: {self.best_val_loss:.4f}")
        print(f"{'='*60}\n")

        return self.history