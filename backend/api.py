"""
Unified API for All Trained Models
Loads all 5 models and provides prediction endpoint with model selection
"""

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms, models
from transformers import (
    BertTokenizer,
    BertModel,
    RobertaTokenizer,
    RobertaModel,
    DistilBertTokenizer,
    DistilBertModel,
    ViTModel,
    CLIPProcessor,
    CLIPModel,
)
import io
import pytesseract
from typing import Optional

app = FastAPI(title="Hate Meme Detection API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ============================================================================
# Model Architectures (same as train_with_metrics.py)
# ============================================================================


class ResNetBERTModel(nn.Module):
    def __init__(self, text_model="bert-base-uncased"):
        super().__init__()
        resnet = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        self.visual_features = nn.Sequential(*list(resnet.children())[:-1])
        self.visual_projection = nn.Sequential(
            nn.Linear(2048, 1024), nn.ReLU(), nn.Dropout(0.3), nn.Linear(1024, 512)
        )

        if "roberta" in text_model:
            self.text_encoder = RobertaModel.from_pretrained(text_model)
        elif "distilbert" in text_model:
            self.text_encoder = DistilBertModel.from_pretrained(text_model)
        else:
            self.text_encoder = BertModel.from_pretrained(text_model)

        for param in self.visual_features.parameters():
            param.requires_grad = False

        self.fusion = nn.Sequential(
            nn.Linear(512 + 768, 512),
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
        with torch.no_grad():
            visual = self.visual_features(images)
        visual = visual.view(visual.size(0), -1)
        visual = self.visual_projection(visual)

        tokens = tokenizer(
            texts, padding=True, truncation=True, max_length=128, return_tensors="pt"
        )
        tokens = {k: v.to(DEVICE) for k, v in tokens.items()}
        text = self.text_encoder(**tokens).last_hidden_state[:, 0, :]

        combined = torch.cat([visual, text], dim=1)
        return self.fusion(combined)


class ViTBERTModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.vit = ViTModel.from_pretrained("google/vit-base-patch16-224-in21k")
        self.visual_projection = nn.Sequential(
            nn.Linear(768, 512), nn.ReLU(), nn.Dropout(0.3)
        )
        self.bert = BertModel.from_pretrained("bert-base-uncased")
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
        visual = self.vit(pixel_values=images).last_hidden_state[:, 0, :]
        visual = self.visual_projection(visual)

        tokens = tokenizer(
            texts, padding=True, truncation=True, max_length=128, return_tensors="pt"
        )
        tokens = {k: v.to(DEVICE) for k, v in tokens.items()}
        text = self.bert(**tokens).last_hidden_state[:, 0, :]

        combined = torch.cat([visual, text], dim=1)
        return self.fusion(combined)


class EfficientNetDistilBERTModel(nn.Module):
    def __init__(self):
        super().__init__()
        efficientnet = models.efficientnet_b0(
            weights=models.EfficientNet_B0_Weights.DEFAULT
        )
        self.visual_features = nn.Sequential(*list(efficientnet.children())[:-1])
        self.visual_projection = nn.Sequential(
            nn.Linear(1280, 512), nn.ReLU(), nn.Dropout(0.3)
        )
        self.distilbert = DistilBertModel.from_pretrained("distilbert-base-uncased")

        for param in self.visual_features.parameters():
            param.requires_grad = False

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
        with torch.no_grad():
            visual = self.visual_features(images)
        visual = visual.view(visual.size(0), -1)
        visual = self.visual_projection(visual)

        tokens = tokenizer(
            texts, padding=True, truncation=True, max_length=128, return_tensors="pt"
        )
        tokens = {k: v.to(DEVICE) for k, v in tokens.items()}
        text = self.distilbert(**tokens).last_hidden_state[:, 0, :]

        combined = torch.cat([visual, text], dim=1)
        return self.fusion(combined)


class CLIPBasedModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.clip = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
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
        inputs = processor(text=texts, images=images, return_tensors="pt", padding=True)
        inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
        outputs = self.clip(**inputs)
        combined = outputs.image_embeds + outputs.text_embeds
        return self.fusion(combined)


# ============================================================================
# Model Loading
# ============================================================================

MODEL_CONFIGS = {
    "resnet50_bert": {
        "class": ResNetBERTModel,
        "args": ["bert-base-uncased"],
        "tokenizer": BertTokenizer.from_pretrained("bert-base-uncased"),
        "path": "./resnet50_bert.pt",
    },
    "resnet50_roberta": {
        "class": ResNetBERTModel,
        "args": ["roberta-base"],
        "tokenizer": RobertaTokenizer.from_pretrained("roberta-base"),
        "path": "./resnet50_roberta.pt",
    },
    "vit_bert": {
        "class": ViTBERTModel,
        "args": [],
        "tokenizer": BertTokenizer.from_pretrained("bert-base-uncased"),
        "path": "./vit_bert.pt",
    },
    "efficientnet_distilbert": {
        "class": EfficientNetDistilBERTModel,
        "args": [],
        "tokenizer": DistilBertTokenizer.from_pretrained("distilbert-base-uncased"),
        "path": "./efficientnet_distilbert.pt",
    },
    "clip_finetuned": {
        "class": CLIPBasedModel,
        "args": [],
        "tokenizer": CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32"),
        "path": "./clip_finetuned.pt",
    },
}

loaded_models = {}


def load_model(model_name: str):
    """Load a specific model"""
    if model_name in loaded_models:
        return loaded_models[model_name]

    if model_name not in MODEL_CONFIGS:
        raise ValueError(f"Unknown model: {model_name}")

    config = MODEL_CONFIGS[model_name]
    model = config["class"](*config["args"]).to(DEVICE)

    try:
        model.load_state_dict(torch.load(config["path"], map_location=DEVICE))
        model.eval()
        loaded_models[model_name] = model
        print(f"✓ Loaded model: {model_name}")
        return model
    except FileNotFoundError:
        print(f"⚠ Model file not found: {config['path']}")
        return None


# Image preprocessing
transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


@app.on_event("startup")
async def startup_event():
    """Load all available models on startup"""
    print("Loading models...")
    for model_name in MODEL_CONFIGS.keys():
        try:
            load_model(model_name)
        except Exception as e:
            print(f"Failed to load {model_name}: {e}")
    print(f"✓ API ready with {len(loaded_models)} models")


@app.get("/")
async def root():
    return {
        "message": "Hate Meme Detection API",
        "available_models": list(MODEL_CONFIGS.keys()),
        "loaded_models": list(loaded_models.keys()),
    }


@app.get("/models")
async def list_models():
    """List all available models"""
    return {
        "models": [
            {
                "id": name,
                "loaded": name in loaded_models,
                "description": MODEL_CONFIGS[name].get("description", ""),
            }
            for name in MODEL_CONFIGS.keys()
        ]
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...), model: str = Form("resnet50_bert")):
    """
    Predict if an image contains hateful content

    Parameters:
    - file: Image file (PNG, JPG, JPEG)
    - model: Model to use (default: resnet50_bert)
    """

    # Load model if not already loaded
    if model not in loaded_models:
        loaded_model = load_model(model)
        if loaded_model is None:
            return {"error": f"Model {model} not available"}
    else:
        loaded_model = loaded_models[model]

    # Read and preprocess image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Extract text with OCR
    try:
        text = pytesseract.image_to_string(image).strip()
        if not text:
            text = "No text detected"
    except:
        text = "OCR failed"

    # Preprocess image
    image_tensor = transform(image).unsqueeze(0).to(DEVICE)

    # Get tokenizer
    tokenizer = MODEL_CONFIGS[model]["tokenizer"]

    # Predict
    with torch.no_grad():
        output = loaded_model(image_tensor, [text], tokenizer)
        probability = torch.sigmoid(output).item()
        prediction = int(probability > 0.5)

    return {
        "model": model,
        "prediction": prediction,
        "label": "HATE" if prediction == 1 else "NOT_HATE",
        "confidence": max(probability, 1 - probability),
        "probability_hateful": probability,
        "text": text,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
