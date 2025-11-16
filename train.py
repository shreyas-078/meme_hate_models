"""
Enhanced Training Script with Comprehensive Metrics Logging
Saves detailed metrics for dashboard visualization
"""

import json
import time
from datetime import datetime
from pathlib import Path
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
from torchvision import models
from transformers import (
    BertTokenizer,
    BertModel,
    RobertaTokenizer,
    RobertaModel,
    DistilBertTokenizer,
    DistilBertModel,
    CLIPProcessor,
    CLIPModel,
)
from transformers import ViTImageProcessor, ViTModel
from PIL import Image
from tqdm import tqdm
import os

# Configuration
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
BATCH_SIZE = 64
EPOCHS = 15
LEARNING_RATE = 1e-4
DATA_PATH = "../data/hate_memes_clean"
METRICS_DIR = Path("../metrics")
METRICS_DIR.mkdir(exist_ok=True)

print(f"Using device: {DEVICE}")

# ============================================================================
# Dataset
# ============================================================================


class HateMemeDataset(Dataset):
    def __init__(self, json_path, transform=None, tokenizer_name="bert-base-uncased"):
        with open(json_path, "r") as f:
            self.data = json.load(f)
        self.transform = transform

        # Support different tokenizers
        if "roberta" in tokenizer_name:
            self.tokenizer = RobertaTokenizer.from_pretrained(tokenizer_name)
        elif "distilbert" in tokenizer_name:
            self.tokenizer = DistilBertTokenizer.from_pretrained(tokenizer_name)
        else:
            self.tokenizer = BertTokenizer.from_pretrained(tokenizer_name)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        img_path = os.path.join("..", item["img"])
        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        text = item.get("text", "")
        label = item["label"]
        return image, text, label


class CLIPDataset(Dataset):
    """Special dataset for CLIP - returns raw PIL images instead of tensors"""

    def __init__(self, json_path, processor=None):
        with open(json_path, "r") as f:
            self.data = json.load(f)
        # Optional CLIP processor to pre-process images into pixel_values
        self.processor = processor

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        img_path = os.path.join("..", item["img"])
        image = Image.open(img_path).convert("RGB")
        text = item.get("text", "")
        label = item["label"]
        # If a CLIP processor is supplied, return preprocessed tensors
        if self.processor is not None:
            # processor(text=..., images=...) returns tensors with batch dim; remove it
            inputs = self.processor(text=None, images=image, return_tensors="pt")
            # pixel_values: (1, C, H, W) -> remove batch dim
            pixel_values = inputs["pixel_values"].squeeze(0)
            return pixel_values, text, label

        # Fallback: return raw PIL image (kept for compatibility)
        return image, text, label


# ============================================================================
# Loss Functions
# ============================================================================


class FocalLoss(nn.Module):
    def __init__(self, alpha=0.7, gamma=2.0):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma

    def forward(self, inputs, targets):
        bce_loss = nn.functional.binary_cross_entropy_with_logits(
            inputs, targets, reduction="none"
        )
        pt = torch.exp(-bce_loss)
        alpha_t = self.alpha * targets + (1 - self.alpha) * (1 - targets)
        focal_loss = alpha_t * (1 - pt) ** self.gamma * bce_loss
        return focal_loss.mean()


# ============================================================================
# Model Architectures
# ============================================================================


class ResNetBERTModel(nn.Module):
    """Architecture 1: ResNet50 + BERT"""

    def __init__(self, text_model="bert-base-uncased"):
        super().__init__()

        # Visual encoder
        resnet = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        self.visual_features = nn.Sequential(*list(resnet.children())[:-1])
        self.visual_projection = nn.Sequential(
            nn.Linear(2048, 1024), nn.ReLU(), nn.Dropout(0.3), nn.Linear(1024, 512)
        )

        # Text encoder
        if "roberta" in text_model:
            self.text_encoder = RobertaModel.from_pretrained(text_model)
            text_dim = 768
        elif "distilbert" in text_model:
            self.text_encoder = DistilBertModel.from_pretrained(text_model)
            text_dim = 768
        else:
            self.text_encoder = BertModel.from_pretrained(text_model)
            text_dim = 768

        # Freeze ResNet
        for param in self.visual_features.parameters():
            param.requires_grad = False

        # Fusion layers
        self.fusion = nn.Sequential(
            nn.Linear(512 + text_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 1),
        )

    def forward(self, images, texts, tokenizer):
        # Visual features
        with torch.no_grad():
            visual = self.visual_features(images)
        visual = visual.view(visual.size(0), -1)
        visual = self.visual_projection(visual)

        # Text features
        tokens = tokenizer(
            texts, padding=True, truncation=True, max_length=128, return_tensors="pt"
        )
        tokens = {k: v.to(DEVICE) for k, v in tokens.items()}
        text = self.text_encoder(**tokens).last_hidden_state[:, 0, :]

        # Fusion
        combined = torch.cat([visual, text], dim=1)
        return self.fusion(combined)


class ViTBERTModel(nn.Module):
    """Architecture 2: Vision Transformer + BERT"""

    def __init__(self):
        super().__init__()

        # ViT encoder
        self.vit = ViTModel.from_pretrained("google/vit-base-patch16-224-in21k")
        self.visual_projection = nn.Sequential(
            nn.Linear(768, 512), nn.ReLU(), nn.Dropout(0.3)
        )

        # BERT encoder
        self.bert = BertModel.from_pretrained("bert-base-uncased")

        # Fusion
        self.fusion = nn.Sequential(
            nn.Linear(512 + 768, 512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
        )

    def forward(self, images, texts, tokenizer):
        # ViT features
        visual = self.vit(pixel_values=images).last_hidden_state[:, 0, :]
        visual = self.visual_projection(visual)

        # BERT features
        tokens = tokenizer(
            texts, padding=True, truncation=True, max_length=128, return_tensors="pt"
        )
        tokens = {k: v.to(DEVICE) for k, v in tokens.items()}
        text = self.bert(**tokens).last_hidden_state[:, 0, :]

        # Fusion
        combined = torch.cat([visual, text], dim=1)
        return self.fusion(combined)


class EfficientNetDistilBERTModel(nn.Module):
    """Architecture 3: EfficientNet + DistilBERT (Lightweight)"""

    def __init__(self):
        super().__init__()

        # EfficientNet encoder
        efficientnet = models.efficientnet_b0(
            weights=models.EfficientNet_B0_Weights.DEFAULT
        )
        self.visual_features = nn.Sequential(*list(efficientnet.children())[:-1])
        self.visual_projection = nn.Sequential(
            nn.Linear(1280, 512), nn.ReLU(), nn.Dropout(0.3)
        )

        # DistilBERT encoder (smaller, faster)
        self.distilbert = DistilBertModel.from_pretrained("distilbert-base-uncased")

        # Freeze visual base
        for param in self.visual_features.parameters():
            param.requires_grad = False

        # Fusion
        self.fusion = nn.Sequential(
            nn.Linear(512 + 768, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 1),
        )

    def forward(self, images, texts, tokenizer):
        # EfficientNet features
        with torch.no_grad():
            visual = self.visual_features(images)
        visual = visual.view(visual.size(0), -1)
        visual = self.visual_projection(visual)

        # DistilBERT features
        tokens = tokenizer(
            texts, padding=True, truncation=True, max_length=128, return_tensors="pt"
        )
        tokens = {k: v.to(DEVICE) for k, v in tokens.items()}
        text = self.distilbert(**tokens).last_hidden_state[:, 0, :]

        # Fusion
        combined = torch.cat([visual, text], dim=1)
        return self.fusion(combined)


class SimpleCNNLSTMModel(nn.Module):
    """Architecture 4: Simple CNN + LSTM (Baseline)"""

    def __init__(self, vocab_size=10000, embed_dim=128):
        super().__init__()

        # Simple CNN for images
        self.cnn = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(128, 256, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.AdaptiveAvgPool2d((4, 4)),
        )
        self.visual_fc = nn.Sequential(
            nn.Linear(256 * 4 * 4, 512), nn.ReLU(), nn.Dropout(0.3)
        )

        # LSTM for text
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, 256, batch_first=True, bidirectional=True)

        # Fusion
        self.fusion = nn.Sequential(
            nn.Linear(512 + 512, 512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
        )

    def forward(self, images, text_indices):
        # CNN features
        visual = self.cnn(images)
        visual = visual.view(visual.size(0), -1)
        visual = self.visual_fc(visual)

        # LSTM features
        embedded = self.embedding(text_indices)
        lstm_out, (hidden, _) = self.lstm(embedded)
        text = torch.cat([hidden[0], hidden[1]], dim=1)

        # Fusion
        combined = torch.cat([visual, text], dim=1)
        return self.fusion(combined)


class CLIPBasedModel(nn.Module):
    """Architecture 5: CLIP-based (Zero-shot capable)"""

    def __init__(self):
        super().__init__()

        # CLIP model
        self.clip = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")

        # Fine-tuning layers
        self.fusion = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 1),
        )

    def forward(self, images, texts, processor):
        # If images are already preprocessed pixel_values tensors (batch, C, H, W),
        # we only need to tokenize the texts and pass both to CLIPModel. Otherwise,
        # fall back to using the processor for both.
        if isinstance(images, torch.Tensor):
            # Tokenize texts only
            text_inputs = processor(
                text=texts, return_tensors="pt", padding=True, truncation=True
            )
            inputs = {
                "pixel_values": images,
                "input_ids": text_inputs["input_ids"],
                "attention_mask": text_inputs.get("attention_mask"),
            }
        else:
            # images are raw PIL images -> delegate to processor
            inputs = processor(
                text=texts,
                images=images,
                return_tensors="pt",
                padding=True,
                truncation=True,
            )

        # Move tensors to device
        inputs = {k: v.to(DEVICE) for k, v in inputs.items() if v is not None}

        # Get CLIP features
        outputs = self.clip(**inputs)

        # Combine image and text features
        combined = outputs.image_embeds + outputs.text_embeds

        return self.fusion(combined)


# ============================================================================
# Training with Metrics
# ============================================================================


def train_with_metrics(
    model,
    train_loader,
    val_loader,
    model_name,
    tokenizer=None,
    epochs=EPOCHS,
    use_focal=True,
):
    """Train model and save comprehensive metrics"""

    model = model.to(DEVICE)
    criterion = FocalLoss(alpha=0.7, gamma=2.0) if use_focal else nn.BCEWithLogitsLoss()
    optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=0.01)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    scaler = torch.cuda.amp.GradScaler()

    metrics = {
        "model_name": model_name,
        "start_time": datetime.now().isoformat(),
        "architecture": str(model.__class__.__name__),
        "total_params": sum(p.numel() for p in model.parameters()),
        "trainable_params": sum(
            p.numel() for p in model.parameters() if p.requires_grad
        ),
        "use_focal_loss": use_focal,
        "batch_size": BATCH_SIZE,
        "learning_rate": LEARNING_RATE,
        "epochs": [],
        "training_time_seconds": 0,
    }

    best_f1 = 0.0
    training_start = time.time()

    print(f"\n{'='*80}")
    print(f"Training: {model_name}")
    print(f"{'='*80}\n")

    for epoch in range(epochs):
        epoch_start = time.time()
        model.train()

        train_loss = 0.0
        train_correct = 0
        train_total = 0

        pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{epochs}")
        for images, texts, labels in pbar:
            images = images.to(DEVICE)
            labels = labels.float().to(DEVICE).unsqueeze(1)

            optimizer.zero_grad()

            with torch.cuda.amp.autocast():
                if tokenizer:
                    outputs = model(images, texts, tokenizer)
                else:
                    outputs = model(images, texts)
                loss = criterion(outputs, labels)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            predicted = torch.round(torch.sigmoid(outputs))
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()
            train_loss += loss.item()

            pbar.set_postfix(
                {"loss": loss.item(), "acc": 100 * train_correct / train_total}
            )

        # Validation
        model.eval()
        val_tp = val_fp = val_tn = val_fn = 0
        val_loss = 0.0

        with torch.no_grad():
            for images, texts, labels in val_loader:
                images = images.to(DEVICE)
                labels = labels.float().to(DEVICE).unsqueeze(1)

                with torch.cuda.amp.autocast():
                    if tokenizer:
                        outputs = model(images, texts, tokenizer)
                    else:
                        outputs = model(images, texts)
                    loss = criterion(outputs, labels)

                val_loss += loss.item()
                predicted = torch.round(torch.sigmoid(outputs))

                val_tp += ((predicted == 1) & (labels == 1)).sum().item()
                val_fp += ((predicted == 1) & (labels == 0)).sum().item()
                val_tn += ((predicted == 0) & (labels == 0)).sum().item()
                val_fn += ((predicted == 0) & (labels == 1)).sum().item()

        # Calculate metrics
        precision = val_tp / (val_tp + val_fp) if (val_tp + val_fp) > 0 else 0.0
        recall = val_tp / (val_tp + val_fn) if (val_tp + val_fn) > 0 else 0.0
        f1 = (
            2 * precision * recall / (precision + recall)
            if (precision + recall) > 0
            else 0.0
        )
        val_acc = (val_tp + val_tn) / (val_tp + val_fp + val_tn + val_fn)

        epoch_time = time.time() - epoch_start

        # Save epoch metrics
        epoch_metrics = {
            "epoch": epoch + 1,
            "train_loss": train_loss / len(train_loader),
            "train_accuracy": train_correct / train_total,
            "val_loss": val_loss / len(val_loader),
            "val_accuracy": val_acc,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "tp": val_tp,
            "fp": val_fp,
            "tn": val_tn,
            "fn": val_fn,
            "epoch_time_seconds": epoch_time,
            "learning_rate": scheduler.get_last_lr()[0],
        }
        metrics["epochs"].append(epoch_metrics)

        print(f"\nEpoch {epoch+1}/{epochs}:")
        print(
            f"  Train Loss: {epoch_metrics['train_loss']:.4f} | Acc: {epoch_metrics['train_accuracy']*100:.2f}%"
        )
        print(f"  Val Loss: {epoch_metrics['val_loss']:.4f} | Acc: {val_acc*100:.2f}%")
        print(f"  Precision: {precision:.4f} | Recall: {recall:.4f} | F1: {f1:.4f}")
        print(f"  Time: {epoch_time:.1f}s")

        # Save best model
        if f1 > best_f1:
            best_f1 = f1
            torch.save(model.state_dict(), f"./{model_name}.pt")
            print(f"  ✓ Saved best model (F1: {f1:.4f})")

        scheduler.step()

    # Final metrics
    metrics["training_time_seconds"] = time.time() - training_start
    metrics["end_time"] = datetime.now().isoformat()
    metrics["best_f1"] = best_f1

    # Save metrics JSON
    with open(METRICS_DIR / f"{model_name}_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\n✓ Training complete! Best F1: {best_f1:.4f}")
    print(f"✓ Total time: {metrics['training_time_seconds']/60:.1f} minutes")
    print(f"✓ Metrics saved to: {METRICS_DIR / f'{model_name}_metrics.json'}")

    return metrics


# ============================================================================
# Main Training Pipeline
# ============================================================================


def main():
    # Data transforms
    transform = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )

    print("=" * 80)
    print("MULTI-MODEL TRAINING PIPELINE")
    print("=" * 80)

    # Model configurations
    models_to_train = [
        {
            "name": "resnet50_bert",
            "model": ResNetBERTModel("bert-base-uncased"),
            "tokenizer": BertTokenizer.from_pretrained("bert-base-uncased"),
            "dataset_tokenizer": "bert-base-uncased",
            "description": "ResNet50 visual encoder + BERT text encoder",
        },
        {
            "name": "resnet50_roberta",
            "model": ResNetBERTModel("roberta-base"),
            "tokenizer": RobertaTokenizer.from_pretrained("roberta-base"),
            "dataset_tokenizer": "roberta-base",
            "description": "ResNet50 visual encoder + RoBERTa text encoder",
        },
        # Skip ViT due to GPU memory constraints
        # {
        #     "name": "vit_bert",
        #     "model": ViTBERTModel(),
        #     "tokenizer": BertTokenizer.from_pretrained("bert-base-uncased"),
        #     "dataset_tokenizer": "bert-base-uncased",
        #     "description": "Vision Transformer + BERT (full transformer architecture)",
        # },
        {
            "name": "efficientnet_distilbert",
            "model": EfficientNetDistilBERTModel(),
            "tokenizer": DistilBertTokenizer.from_pretrained("distilbert-base-uncased"),
            "dataset_tokenizer": "distilbert-base-uncased",
            "description": "Lightweight: EfficientNet-B0 + DistilBERT",
        },
        {
            "name": "clip_finetuned",
            "model": CLIPBasedModel(),
            "tokenizer": CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32"),
            "dataset_tokenizer": "bert-base-uncased",  # For dataset class
            "description": "CLIP-based model with fine-tuning layers",
        },
    ]

    all_metrics = []

    for config in models_to_train:
        print(f"\n\n{'='*80}")
        print(f"Starting: {config['name']}")
        print(f"{'='*80}\n")

        # Use special dataset for CLIP (needs raw PIL images)
        if config["name"] == "clip_finetuned":
            # Pass the CLIP processor so the dataset returns preprocessed tensors
            train_dataset = CLIPDataset(
                f"{DATA_PATH}/train.json", processor=config["tokenizer"]
            )
            val_dataset = CLIPDataset(
                f"{DATA_PATH}/dev.json", processor=config["tokenizer"]
            )
        else:
            # Load datasets with appropriate tokenizer
            train_dataset = HateMemeDataset(
                f"{DATA_PATH}/train.json",
                transform=transform,
                tokenizer_name=config["dataset_tokenizer"],
            )
            val_dataset = HateMemeDataset(
                f"{DATA_PATH}/dev.json",
                transform=transform,
                tokenizer_name=config["dataset_tokenizer"],
            )

        train_loader = DataLoader(
            train_dataset,
            batch_size=BATCH_SIZE,
            shuffle=True,
            num_workers=4,
            pin_memory=True,
        )
        val_loader = DataLoader(
            val_dataset, batch_size=BATCH_SIZE, num_workers=4, pin_memory=True
        )

        # Train
        metrics = train_with_metrics(
            config["model"],
            train_loader,
            val_loader,
            config["name"],
            tokenizer=config["tokenizer"],
        )
        metrics["description"] = config["description"]
        all_metrics.append(metrics)

    # Save summary
    summary = {
        "training_date": datetime.now().isoformat(),
        "total_models": len(all_metrics),
        "models": [
            {
                "name": m["model_name"],
                "best_f1": m["best_f1"],
                "training_time_minutes": m["training_time_seconds"] / 60,
                "total_params": m["total_params"],
                "trainable_params": m["trainable_params"],
            }
            for m in all_metrics
        ],
    }

    with open(METRICS_DIR / "training_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n\n{'='*80}")
    print("ALL MODELS TRAINED!")
    print(f"{'='*80}")
    print(f"\nSummary saved to: {METRICS_DIR / 'training_summary.json'}")


if __name__ == "__main__":
    main()
