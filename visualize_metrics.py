"""
Comprehensive visualization script for Hateful Meme Classification models.
Generates publication-quality figures for research reports.
"""

import json
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
from pathlib import Path
from matplotlib.patches import Rectangle
import warnings

warnings.filterwarnings("ignore")

# Set publication-quality style
plt.style.use("seaborn-v0_8-darkgrid")
sns.set_palette("husl")
plt.rcParams["figure.dpi"] = 300
plt.rcParams["font.size"] = 10
plt.rcParams["axes.labelsize"] = 11
plt.rcParams["axes.titlesize"] = 12
plt.rcParams["legend.fontsize"] = 9
plt.rcParams["figure.titlesize"] = 14

# Define paths
METRICS_DIR = Path("metrics")
OUTPUT_DIR = Path("visualizations")
OUTPUT_DIR.mkdir(exist_ok=True)

# Model names mapping for better display
MODEL_NAMES = {
    "resnet50_bert": "ResNet50-BERT",
    "resnet50_roberta": "ResNet50-RoBERTa",
    "efficientnet_distilbert": "EfficientNet-DistilBERT",
    "clip_finetuned": "CLIP (Fine-tuned)",
    "vit_bert": "ViT-BERT",
}

# Color scheme for models
MODEL_COLORS = {
    "ResNet50-BERT": "#e74c3c",
    "ResNet50-RoBERTa": "#3498db",
    "EfficientNet-DistilBERT": "#2ecc71",
    "CLIP (Fine-tuned)": "#f39c12",
    "ViT-BERT": "#9b59b6",
}


def load_metrics():
    """Load all model metrics from JSON files."""
    metrics = {}

    # Load individual model metrics
    for model_file in METRICS_DIR.glob("*_metrics.json"):
        if model_file.stem == "training_summary":
            continue
        with open(model_file, "r") as f:
            data = json.load(f)
            metrics[data["model_name"]] = data

    # Load training summary
    with open(METRICS_DIR / "training_summary.json", "r") as f:
        metrics["summary"] = json.load(f)

    return metrics


def plot_training_curves(metrics):
    """Plot training and validation loss/accuracy curves for all models."""
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Training Dynamics Across All Models", fontsize=16, fontweight="bold")

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)
        color = MODEL_COLORS[display_name]
        epochs = [e["epoch"] for e in model_data["epochs"]]

        # Training Loss
        train_loss = [e["train_loss"] for e in model_data["epochs"]]
        axes[0, 0].plot(
            epochs,
            train_loss,
            marker="o",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

        # Validation Loss
        val_loss = [e["val_loss"] for e in model_data["epochs"]]
        axes[0, 1].plot(
            epochs,
            val_loss,
            marker="s",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

        # Training Accuracy
        train_acc = [e["train_accuracy"] for e in model_data["epochs"]]
        axes[1, 0].plot(
            epochs,
            train_acc,
            marker="o",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

        # Validation Accuracy
        val_acc = [e["val_accuracy"] for e in model_data["epochs"]]
        axes[1, 1].plot(
            epochs,
            val_acc,
            marker="s",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

    # Configure subplots
    axes[0, 0].set_title("Training Loss", fontweight="bold")
    axes[0, 0].set_xlabel("Epoch")
    axes[0, 0].set_ylabel("Loss")
    axes[0, 0].legend(loc="upper right")
    axes[0, 0].grid(True, alpha=0.3)

    axes[0, 1].set_title("Validation Loss", fontweight="bold")
    axes[0, 1].set_xlabel("Epoch")
    axes[0, 1].set_ylabel("Loss")
    axes[0, 1].legend(loc="upper right")
    axes[0, 1].grid(True, alpha=0.3)

    axes[1, 0].set_title("Training Accuracy", fontweight="bold")
    axes[1, 0].set_xlabel("Epoch")
    axes[1, 0].set_ylabel("Accuracy")
    axes[1, 0].legend(loc="lower right")
    axes[1, 0].grid(True, alpha=0.3)

    axes[1, 1].set_title("Validation Accuracy", fontweight="bold")
    axes[1, 1].set_xlabel("Epoch")
    axes[1, 1].set_ylabel("Accuracy")
    axes[1, 1].legend(loc="lower right")
    axes[1, 1].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "1_training_curves.png", bbox_inches="tight")
    print(f"✓ Saved: 1_training_curves.png")
    plt.close()


def plot_f1_scores_evolution(metrics):
    """Plot F1 score evolution across epochs."""
    fig, ax = plt.subplots(figsize=(12, 6))

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)
        color = MODEL_COLORS[display_name]
        epochs = [e["epoch"] for e in model_data["epochs"]]
        f1_scores = [e["f1_score"] for e in model_data["epochs"]]

        ax.plot(
            epochs,
            f1_scores,
            marker="o",
            label=display_name,
            color=color,
            linewidth=2.5,
            markersize=6,
        )

        # Mark best F1 score
        best_f1_idx = f1_scores.index(max(f1_scores))
        ax.scatter(
            epochs[best_f1_idx],
            f1_scores[best_f1_idx],
            s=200,
            color=color,
            marker="*",
            edgecolors="black",
            linewidths=1.5,
            zorder=5,
        )

    ax.set_title(
        "F1 Score Evolution Across Training Epochs",
        fontsize=14,
        fontweight="bold",
        pad=15,
    )
    ax.set_xlabel("Epoch", fontsize=12)
    ax.set_ylabel("F1 Score", fontsize=12)
    ax.legend(loc="best", frameon=True, shadow=True)
    ax.grid(True, alpha=0.3, linestyle="--")

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "2_f1_scores_evolution.png", bbox_inches="tight")
    print(f"✓ Saved: 2_f1_scores_evolution.png")
    plt.close()


def plot_best_metrics_comparison(metrics):
    """Compare best metrics across all models."""
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Best Performance Metrics Comparison", fontsize=16, fontweight="bold")

    model_names = []
    best_f1 = []
    best_precision = []
    best_recall = []
    best_accuracy = []

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)
        model_names.append(display_name)

        # Find best epoch based on F1 score
        f1_scores = [e["f1_score"] for e in model_data["epochs"]]
        best_epoch_idx = f1_scores.index(max(f1_scores))
        best_epoch = model_data["epochs"][best_epoch_idx]

        best_f1.append(best_epoch["f1_score"])
        best_precision.append(best_epoch["precision"])
        best_recall.append(best_epoch["recall"])
        best_accuracy.append(best_epoch["val_accuracy"])

    # Sort by F1 score
    sorted_indices = np.argsort(best_f1)[::-1]
    model_names = [model_names[i] for i in sorted_indices]
    best_f1 = [best_f1[i] for i in sorted_indices]
    best_precision = [best_precision[i] for i in sorted_indices]
    best_recall = [best_recall[i] for i in sorted_indices]
    best_accuracy = [best_accuracy[i] for i in sorted_indices]

    colors = [MODEL_COLORS[name] for name in model_names]
    x = np.arange(len(model_names))

    # F1 Score
    bars1 = axes[0, 0].bar(x, best_f1, color=colors, edgecolor="black", linewidth=1.2)
    axes[0, 0].set_title("Best F1 Score", fontweight="bold")
    axes[0, 0].set_ylabel("F1 Score")
    axes[0, 0].set_xticks(x)
    axes[0, 0].set_xticklabels(model_names, rotation=45, ha="right")
    axes[0, 0].grid(axis="y", alpha=0.3)
    for i, (bar, val) in enumerate(zip(bars1, best_f1)):
        axes[0, 0].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.01,
            f"{val:.3f}",
            ha="center",
            va="bottom",
            fontsize=9,
            fontweight="bold",
        )

    # Precision
    bars2 = axes[0, 1].bar(
        x, best_precision, color=colors, edgecolor="black", linewidth=1.2
    )
    axes[0, 1].set_title("Best Precision", fontweight="bold")
    axes[0, 1].set_ylabel("Precision")
    axes[0, 1].set_xticks(x)
    axes[0, 1].set_xticklabels(model_names, rotation=45, ha="right")
    axes[0, 1].grid(axis="y", alpha=0.3)
    for i, (bar, val) in enumerate(zip(bars2, best_precision)):
        axes[0, 1].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.01,
            f"{val:.3f}",
            ha="center",
            va="bottom",
            fontsize=9,
            fontweight="bold",
        )

    # Recall
    bars3 = axes[1, 0].bar(
        x, best_recall, color=colors, edgecolor="black", linewidth=1.2
    )
    axes[1, 0].set_title("Best Recall", fontweight="bold")
    axes[1, 0].set_ylabel("Recall")
    axes[1, 0].set_xticks(x)
    axes[1, 0].set_xticklabels(model_names, rotation=45, ha="right")
    axes[1, 0].grid(axis="y", alpha=0.3)
    for i, (bar, val) in enumerate(zip(bars3, best_recall)):
        axes[1, 0].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.01,
            f"{val:.3f}",
            ha="center",
            va="bottom",
            fontsize=9,
            fontweight="bold",
        )

    # Validation Accuracy
    bars4 = axes[1, 1].bar(
        x, best_accuracy, color=colors, edgecolor="black", linewidth=1.2
    )
    axes[1, 1].set_title("Best Validation Accuracy", fontweight="bold")
    axes[1, 1].set_ylabel("Accuracy")
    axes[1, 1].set_xticks(x)
    axes[1, 1].set_xticklabels(model_names, rotation=45, ha="right")
    axes[1, 1].grid(axis="y", alpha=0.3)
    for i, (bar, val) in enumerate(zip(bars4, best_accuracy)):
        axes[1, 1].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.01,
            f"{val:.3f}",
            ha="center",
            va="bottom",
            fontsize=9,
            fontweight="bold",
        )

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "3_best_metrics_comparison.png", bbox_inches="tight")
    print(f"✓ Saved: 3_best_metrics_comparison.png")
    plt.close()


def plot_confusion_matrices(metrics):
    """Plot confusion matrices for best epoch of each model."""
    n_models = len([k for k in metrics.keys() if k != "summary"])
    fig, axes = plt.subplots(2, 3, figsize=(16, 10))
    axes = axes.flatten()
    fig.suptitle("Confusion Matrices at Best F1 Score", fontsize=16, fontweight="bold")

    for idx, (model_name, model_data) in enumerate(metrics.items()):
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)

        # Find best epoch
        f1_scores = [e["f1_score"] for e in model_data["epochs"]]
        best_epoch_idx = f1_scores.index(max(f1_scores))
        best_epoch = model_data["epochs"][best_epoch_idx]

        # Create confusion matrix
        cm = np.array(
            [[best_epoch["tn"], best_epoch["fp"]], [best_epoch["fn"], best_epoch["tp"]]]
        )

        # Plot heatmap
        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            cmap="Blues",
            ax=axes[idx],
            cbar_kws={"label": "Count"},
            annot_kws={"fontsize": 14, "fontweight": "bold"},
        )
        axes[idx].set_title(
            f'{display_name}\n(F1: {best_epoch["f1_score"]:.3f}, Epoch: {best_epoch["epoch"]})',
            fontweight="bold",
        )
        axes[idx].set_ylabel("Actual")
        axes[idx].set_xlabel("Predicted")
        axes[idx].set_xticklabels(["Non-Hateful", "Hateful"])
        axes[idx].set_yticklabels(["Non-Hateful", "Hateful"])

    # Hide extra subplot
    if n_models < len(axes):
        axes[-1].axis("off")

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "4_confusion_matrices.png", bbox_inches="tight")
    print(f"✓ Saved: 4_confusion_matrices.png")
    plt.close()


def plot_precision_recall_curves(metrics):
    """Plot precision-recall evolution for each model."""
    fig, ax = plt.subplots(figsize=(12, 8))

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)
        color = MODEL_COLORS[display_name]

        precision = [e["precision"] for e in model_data["epochs"]]
        recall = [e["recall"] for e in model_data["epochs"]]

        # Plot precision-recall curve
        ax.plot(
            recall,
            precision,
            marker="o",
            label=display_name,
            color=color,
            linewidth=2.5,
            markersize=5,
            alpha=0.7,
        )

        # Mark best F1 point
        f1_scores = [e["f1_score"] for e in model_data["epochs"]]
        best_idx = f1_scores.index(max(f1_scores))
        ax.scatter(
            recall[best_idx],
            precision[best_idx],
            s=300,
            color=color,
            marker="*",
            edgecolors="black",
            linewidths=2,
            zorder=5,
        )

    ax.set_title(
        "Precision-Recall Curves (Epoch Evolution)",
        fontsize=14,
        fontweight="bold",
        pad=15,
    )
    ax.set_xlabel("Recall", fontsize=12)
    ax.set_ylabel("Precision", fontsize=12)
    ax.legend(loc="best", frameon=True, shadow=True)
    ax.grid(True, alpha=0.3, linestyle="--")
    ax.set_xlim([0, 1])
    ax.set_ylim([0, 1])

    # Add diagonal reference line
    ax.plot([0, 1], [0, 1], "k--", alpha=0.3, linewidth=1, label="Random")

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "5_precision_recall_curves.png", bbox_inches="tight")
    print(f"✓ Saved: 5_precision_recall_curves.png")
    plt.close()


def plot_model_complexity(metrics):
    """Compare model complexity (parameters) vs performance."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    fig.suptitle("Model Complexity Analysis", fontsize=16, fontweight="bold")

    model_names = []
    total_params = []
    trainable_params = []
    best_f1 = []
    training_time = []

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)
        model_names.append(display_name)
        total_params.append(model_data["total_params"] / 1e6)  # Convert to millions
        trainable_params.append(model_data["trainable_params"] / 1e6)
        best_f1.append(model_data["best_f1"])
        training_time.append(
            sum([e["epoch_time_seconds"] for e in model_data["epochs"]]) / 60
        )

    # Plot 1: Parameters comparison
    x = np.arange(len(model_names))
    width = 0.35

    bars1 = axes[0].bar(
        x - width / 2,
        total_params,
        width,
        label="Total Parameters",
        color="steelblue",
        edgecolor="black",
        linewidth=1.2,
    )
    bars2 = axes[0].bar(
        x + width / 2,
        trainable_params,
        width,
        label="Trainable Parameters",
        color="lightcoral",
        edgecolor="black",
        linewidth=1.2,
    )

    axes[0].set_title("Model Parameter Count", fontweight="bold")
    axes[0].set_ylabel("Parameters (Millions)", fontsize=11)
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(model_names, rotation=45, ha="right")
    axes[0].legend()
    axes[0].grid(axis="y", alpha=0.3)

    # Add value labels
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            axes[0].text(
                bar.get_x() + bar.get_width() / 2,
                height + 2,
                f"{height:.1f}M",
                ha="center",
                va="bottom",
                fontsize=8,
            )

    # Plot 2: Parameters vs Performance
    colors = [MODEL_COLORS[name] for name in model_names]
    scatter = axes[1].scatter(
        total_params,
        best_f1,
        s=[t * 20 for t in training_time],
        c=colors,
        alpha=0.6,
        edgecolors="black",
        linewidths=1.5,
    )

    for i, name in enumerate(model_names):
        axes[1].annotate(
            name,
            (total_params[i], best_f1[i]),
            xytext=(5, 5),
            textcoords="offset points",
            fontsize=9,
            fontweight="bold",
        )

    axes[1].set_title("Model Complexity vs Performance", fontweight="bold")
    axes[1].set_xlabel("Total Parameters (Millions)", fontsize=11)
    axes[1].set_ylabel("Best F1 Score", fontsize=11)
    axes[1].grid(True, alpha=0.3)

    # Add legend for bubble size
    legend_elements = [
        plt.Line2D(
            [0],
            [0],
            marker="o",
            color="w",
            markerfacecolor="gray",
            markersize=8,
            label="Bubble size = Training time",
        )
    ]
    axes[1].legend(handles=legend_elements, loc="lower right")

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "6_model_complexity.png", bbox_inches="tight")
    print(f"✓ Saved: 6_model_complexity.png")
    plt.close()


def plot_training_time_comparison(metrics):
    """Compare training time across models."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    fig.suptitle("Training Time Analysis", fontsize=16, fontweight="bold")

    model_names = []
    total_time = []
    avg_epoch_time = []
    best_f1 = []

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)
        model_names.append(display_name)

        epoch_times = [e["epoch_time_seconds"] for e in model_data["epochs"]]
        total_time.append(sum(epoch_times) / 60)  # Convert to minutes
        avg_epoch_time.append(np.mean(epoch_times))
        best_f1.append(model_data["best_f1"])

    colors = [MODEL_COLORS[name] for name in model_names]
    x = np.arange(len(model_names))

    # Plot 1: Total training time
    bars = axes[0].bar(x, total_time, color=colors, edgecolor="black", linewidth=1.2)
    axes[0].set_title("Total Training Time", fontweight="bold")
    axes[0].set_ylabel("Time (minutes)", fontsize=11)
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(model_names, rotation=45, ha="right")
    axes[0].grid(axis="y", alpha=0.3)

    for bar, val in zip(bars, total_time):
        axes[0].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.05,
            f"{val:.2f}m",
            ha="center",
            va="bottom",
            fontsize=9,
            fontweight="bold",
        )

    # Plot 2: Training efficiency (F1 score per minute)
    efficiency = [f1 / time for f1, time in zip(best_f1, total_time)]
    bars = axes[1].bar(x, efficiency, color=colors, edgecolor="black", linewidth=1.2)
    axes[1].set_title("Training Efficiency (F1 Score / Minute)", fontweight="bold")
    axes[1].set_ylabel("F1 Score per Minute", fontsize=11)
    axes[1].set_xticks(x)
    axes[1].set_xticklabels(model_names, rotation=45, ha="right")
    axes[1].grid(axis="y", alpha=0.3)

    for bar, val in zip(bars, efficiency):
        axes[1].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.003,
            f"{val:.3f}",
            ha="center",
            va="bottom",
            fontsize=9,
            fontweight="bold",
        )

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "7_training_time_comparison.png", bbox_inches="tight")
    print(f"✓ Saved: 7_training_time_comparison.png")
    plt.close()


def plot_learning_rate_schedule(metrics):
    """Plot learning rate schedules for all models."""
    fig, ax = plt.subplots(figsize=(12, 6))

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)
        color = MODEL_COLORS[display_name]

        epochs = [e["epoch"] for e in model_data["epochs"]]
        learning_rates = [e["learning_rate"] for e in model_data["epochs"]]

        ax.plot(
            epochs,
            learning_rates,
            marker="o",
            label=display_name,
            color=color,
            linewidth=2.5,
            markersize=5,
        )

    ax.set_title(
        "Learning Rate Schedule (Cosine Annealing)",
        fontsize=14,
        fontweight="bold",
        pad=15,
    )
    ax.set_xlabel("Epoch", fontsize=12)
    ax.set_ylabel("Learning Rate", fontsize=12)
    ax.legend(loc="upper right", frameon=True, shadow=True)
    ax.grid(True, alpha=0.3, linestyle="--")
    ax.set_yscale("log")

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "8_learning_rate_schedule.png", bbox_inches="tight")
    print(f"✓ Saved: 8_learning_rate_schedule.png")
    plt.close()


def plot_overfitting_analysis(metrics):
    """Analyze overfitting by comparing train-val gaps."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    fig.suptitle("Overfitting Analysis", fontsize=16, fontweight="bold")

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)
        color = MODEL_COLORS[display_name]

        epochs = [e["epoch"] for e in model_data["epochs"]]

        # Loss gap
        loss_gap = [e["train_loss"] - e["val_loss"] for e in model_data["epochs"]]
        axes[0].plot(
            epochs,
            loss_gap,
            marker="o",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

        # Accuracy gap
        acc_gap = [
            e["train_accuracy"] - e["val_accuracy"] for e in model_data["epochs"]
        ]
        axes[1].plot(
            epochs,
            acc_gap,
            marker="s",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

    axes[0].set_title("Train-Val Loss Gap", fontweight="bold")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Train Loss - Val Loss")
    axes[0].axhline(y=0, color="black", linestyle="--", alpha=0.5)
    axes[0].legend(loc="best")
    axes[0].grid(True, alpha=0.3)

    axes[1].set_title("Train-Val Accuracy Gap", fontweight="bold")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Train Accuracy - Val Accuracy")
    axes[1].axhline(y=0, color="black", linestyle="--", alpha=0.5)
    axes[1].legend(loc="best")
    axes[1].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "9_overfitting_analysis.png", bbox_inches="tight")
    print(f"✓ Saved: 9_overfitting_analysis.png")
    plt.close()


def plot_classification_metrics_heatmap(metrics):
    """Create a heatmap of all classification metrics at best performance."""
    model_names = []
    f1_scores = []
    precision_scores = []
    recall_scores = []
    accuracy_scores = []

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)
        model_names.append(display_name)

        # Find best epoch
        f1_list = [e["f1_score"] for e in model_data["epochs"]]
        best_epoch_idx = f1_list.index(max(f1_list))
        best_epoch = model_data["epochs"][best_epoch_idx]

        f1_scores.append(best_epoch["f1_score"])
        precision_scores.append(best_epoch["precision"])
        recall_scores.append(best_epoch["recall"])
        accuracy_scores.append(best_epoch["val_accuracy"])

    # Create DataFrame
    df = pd.DataFrame(
        {
            "F1 Score": f1_scores,
            "Precision": precision_scores,
            "Recall": recall_scores,
            "Accuracy": accuracy_scores,
        },
        index=model_names,
    )

    # Sort by F1 score
    df = df.sort_values("F1 Score", ascending=False)

    # Create heatmap
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.heatmap(
        df,
        annot=True,
        fmt=".3f",
        cmap="RdYlGn",
        center=0.5,
        vmin=0,
        vmax=1,
        linewidths=1,
        linecolor="black",
        cbar_kws={"label": "Score"},
        ax=ax,
        annot_kws={"fontsize": 11, "fontweight": "bold"},
    )

    ax.set_title(
        "Best Performance Metrics Heatmap", fontsize=14, fontweight="bold", pad=15
    )
    ax.set_ylabel("Model", fontsize=12)
    ax.set_xlabel("Metric", fontsize=12)

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "10_metrics_heatmap.png", bbox_inches="tight")
    print(f"✓ Saved: 10_metrics_heatmap.png")
    plt.close()


def plot_radar_chart(metrics):
    """Create radar chart comparing model performance across multiple metrics."""
    from math import pi

    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection="polar"))

    # Metrics to compare
    categories = ["F1 Score", "Precision", "Recall", "Accuracy"]
    N = len(categories)

    angles = [n / float(N) * 2 * pi for n in range(N)]
    angles += angles[:1]

    ax.set_theta_offset(pi / 2)
    ax.set_theta_direction(-1)
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, size=11, fontweight="bold")

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)
        color = MODEL_COLORS[display_name]

        # Find best epoch
        f1_list = [e["f1_score"] for e in model_data["epochs"]]
        best_epoch_idx = f1_list.index(max(f1_list))
        best_epoch = model_data["epochs"][best_epoch_idx]

        values = [
            best_epoch["f1_score"],
            best_epoch["precision"],
            best_epoch["recall"],
            best_epoch["val_accuracy"],
        ]
        values += values[:1]

        ax.plot(
            angles,
            values,
            "o-",
            linewidth=2.5,
            label=display_name,
            color=color,
            markersize=8,
        )
        ax.fill(angles, values, alpha=0.15, color=color)

    ax.set_ylim(0, 1)
    ax.set_title(
        "Model Performance Comparison (Radar Chart)",
        fontsize=14,
        fontweight="bold",
        pad=20,
    )
    ax.legend(loc="upper right", bbox_to_anchor=(1.3, 1.1), frameon=True, shadow=True)
    ax.grid(True)

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "11_radar_chart.png", bbox_inches="tight")
    print(f"✓ Saved: 11_radar_chart.png")
    plt.close()


def plot_epoch_by_epoch_metrics(metrics):
    """Create comprehensive epoch-by-epoch visualization."""
    fig, axes = plt.subplots(3, 2, figsize=(14, 12))
    fig.suptitle("Comprehensive Epoch-by-Epoch Metrics", fontsize=16, fontweight="bold")

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)
        color = MODEL_COLORS[display_name]
        epochs = [e["epoch"] for e in model_data["epochs"]]

        # Plot 1: F1 Score
        f1 = [e["f1_score"] for e in model_data["epochs"]]
        axes[0, 0].plot(
            epochs,
            f1,
            marker="o",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

        # Plot 2: Precision
        precision = [e["precision"] for e in model_data["epochs"]]
        axes[0, 1].plot(
            epochs,
            precision,
            marker="s",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

        # Plot 3: Recall
        recall = [e["recall"] for e in model_data["epochs"]]
        axes[1, 0].plot(
            epochs,
            recall,
            marker="^",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

        # Plot 4: True Positives
        tp = [e["tp"] for e in model_data["epochs"]]
        axes[1, 1].plot(
            epochs,
            tp,
            marker="D",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

        # Plot 5: False Positives
        fp = [e["fp"] for e in model_data["epochs"]]
        axes[2, 0].plot(
            epochs,
            fp,
            marker="v",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

        # Plot 6: False Negatives
        fn = [e["fn"] for e in model_data["epochs"]]
        axes[2, 1].plot(
            epochs,
            fn,
            marker="<",
            label=display_name,
            color=color,
            linewidth=2,
            markersize=4,
        )

    titles = [
        "F1 Score",
        "Precision",
        "Recall",
        "True Positives",
        "False Positives",
        "False Negatives",
    ]
    ylabels = ["F1 Score", "Precision", "Recall", "Count", "Count", "Count"]

    for idx, (ax, title, ylabel) in enumerate(zip(axes.flatten(), titles, ylabels)):
        ax.set_title(title, fontweight="bold")
        ax.set_xlabel("Epoch")
        ax.set_ylabel(ylabel)
        ax.legend(loc="best", fontsize=8)
        ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "12_epoch_by_epoch_metrics.png", bbox_inches="tight")
    print(f"✓ Saved: 12_epoch_by_epoch_metrics.png")
    plt.close()


def generate_summary_table(metrics):
    """Generate a summary table as an image."""
    model_data_list = []

    for model_name, model_data in metrics.items():
        if model_name == "summary":
            continue

        display_name = MODEL_NAMES.get(model_name, model_name)

        # Find best epoch
        f1_list = [e["f1_score"] for e in model_data["epochs"]]
        best_epoch_idx = f1_list.index(max(f1_list))
        best_epoch = model_data["epochs"][best_epoch_idx]

        model_data_list.append(
            {
                "Model": display_name,
                "Best F1": f'{best_epoch["f1_score"]:.4f}',
                "Precision": f'{best_epoch["precision"]:.4f}',
                "Recall": f'{best_epoch["recall"]:.4f}',
                "Accuracy": f'{best_epoch["val_accuracy"]:.4f}',
                "Best Epoch": best_epoch["epoch"],
                "Total Params (M)": f'{model_data["total_params"]/1e6:.1f}',
                "Training Time (min)": f'{sum([e["epoch_time_seconds"] for e in model_data["epochs"]])/60:.2f}',
            }
        )

    # Sort by F1 score
    model_data_list.sort(key=lambda x: float(x["Best F1"]), reverse=True)

    df = pd.DataFrame(model_data_list)

    fig, ax = plt.subplots(figsize=(14, 5))
    ax.axis("tight")
    ax.axis("off")

    table = ax.table(
        cellText=df.values,
        colLabels=df.columns,
        cellLoc="center",
        loc="center",
        colColours=["#4CAF50"] * len(df.columns),
    )

    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 2)

    # Style the header
    for i in range(len(df.columns)):
        table[(0, i)].set_facecolor("#2E7D32")
        table[(0, i)].set_text_props(weight="bold", color="white")

    # Color rows alternately
    for i in range(1, len(df) + 1):
        for j in range(len(df.columns)):
            if i % 2 == 0:
                table[(i, j)].set_facecolor("#E8F5E9")
            else:
                table[(i, j)].set_facecolor("#FFFFFF")

    # Highlight best F1 score
    best_f1_row = 1  # First data row after header
    for j in range(len(df.columns)):
        table[(best_f1_row, j)].set_facecolor("#FFF9C4")
        table[(best_f1_row, j)].set_text_props(weight="bold")

    plt.title("Model Performance Summary Table", fontsize=16, fontweight="bold", pad=20)
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / "13_summary_table.png", bbox_inches="tight", dpi=300)
    print(f"✓ Saved: 13_summary_table.png")
    plt.close()


def main():
    """Main function to generate all visualizations."""
    print("\n" + "=" * 60)
    print("  Hateful Meme Classification - Metrics Visualization")
    print("=" * 60 + "\n")

    # Load metrics
    print("Loading metrics data...")
    metrics = load_metrics()
    print(f"✓ Loaded metrics for {len(metrics)-1} models\n")

    # Generate all visualizations
    print("Generating visualizations...\n")

    plot_training_curves(metrics)
    plot_f1_scores_evolution(metrics)
    plot_best_metrics_comparison(metrics)
    plot_confusion_matrices(metrics)
    plot_precision_recall_curves(metrics)
    plot_model_complexity(metrics)
    plot_training_time_comparison(metrics)
    plot_learning_rate_schedule(metrics)
    plot_overfitting_analysis(metrics)
    plot_classification_metrics_heatmap(metrics)
    plot_radar_chart(metrics)
    plot_epoch_by_epoch_metrics(metrics)
    generate_summary_table(metrics)

    print("\n" + "=" * 60)
    print(f"  All visualizations saved to: {OUTPUT_DIR}/")
    print("=" * 60 + "\n")
    print("Summary:")
    print(f"  - 13 comprehensive visualizations generated")
    print(f"  - All images saved at 300 DPI for publication quality")
    print(f"  - Ready for inclusion in research reports\n")


if __name__ == "__main__":
    main()
