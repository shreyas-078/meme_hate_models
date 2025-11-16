import { useState } from "react";
import {
    Upload,
    AlertCircle,
    CheckCircle,
    Loader2,
    Image as ImageIcon,
    Sparkles,
} from "lucide-react";
import axios from "axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const MODELS = [
    {
        id: "resnet50_bert",
        name: "ResNet50 + BERT",
        description: "Balanced performance",
    },
    {
        id: "resnet50_roberta",
        name: "ResNet50 + RoBERTa",
        description: "Enhanced text understanding",
    },
    {
        id: "vit_bert",
        name: "ViT + BERT",
        description: "Full transformer architecture",
    },
    {
        id: "efficientnet_distilbert",
        name: "EfficientNet + DistilBERT",
        description: "Fast & lightweight",
    },
    {
        id: "clip_finetuned",
        name: "CLIP Fine-tuned",
        description: "Zero-shot capable",
    },
];

export default function Prediction() {
    const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handlePredict = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", image);
            formData.append("model", selectedModel);

            const response = await axios.post(
                "http://localhost:8000/predict",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            setResult(response.data);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                    "Failed to get prediction. Make sure the API is running."
            );
            console.error("Prediction error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI-Powered Detection
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Hate Meme Detection
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Upload an image and select a model to detect hateful
                        content using state-of-the-art multimodal AI
                    </p>
                </div>

                {/* Model Selector */}
                <Card className="shadow-professional border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            Select Detection Model
                        </CardTitle>
                        <CardDescription>
                            Choose from our collection of fine-tuned multimodal
                            models
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {MODELS.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => setSelectedModel(model.id)}
                                    className={`relative p-5 rounded-xl border-2 transition-all text-left group hover:shadow-lg ${
                                        selectedModel === model.id
                                            ? "border-primary bg-primary/5 shadow-lg"
                                            : "border-border hover:border-primary/50"
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="font-semibold text-foreground">
                                            {model.name}
                                        </div>
                                        {selectedModel === model.id && (
                                            <Badge className="bg-primary">
                                                <CheckCircle className="w-3 h-3" />
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {model.description}
                                    </p>
                                    {selectedModel === model.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-xl" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Image Upload */}
                <Card className="shadow-professional border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-primary" />
                            Upload Image
                        </CardTitle>
                        <CardDescription>
                            Drag and drop or click to select an image for
                            analysis
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!preview ? (
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className="relative border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary transition-all hover:bg-accent/50 group"
                                onClick={() =>
                                    document
                                        .getElementById("file-input")
                                        .click()
                                }
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4 group-hover:text-primary transition-colors" />
                                <p className="text-lg font-semibold text-foreground mb-2">
                                    Drop an image here or click to browse
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Supports PNG, JPG, JPEG formats
                                </p>
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative rounded-xl overflow-hidden bg-accent border">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full max-h-96 object-contain"
                                    />
                                    <button
                                        onClick={() => {
                                            setImage(null);
                                            setPreview(null);
                                            setResult(null);
                                        }}
                                        className="absolute top-4 right-4 rounded-full bg-red-500 text-white w-8 h-8 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>

                                <button
                                    onClick={handlePredict}
                                    disabled={loading}
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Analyzing Image...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Analyze with AI
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results */}
                {result && (
                    <Card
                        className={`shadow-professional border-0 ${
                            result.label === "HATE"
                                ? "ring-2 ring-red-500"
                                : "ring-2 ring-green-500"
                        }`}
                    >
                        <CardHeader
                            className={
                                result.label === "HATE"
                                    ? "bg-red-50 dark:bg-red-950/20"
                                    : "bg-green-50 dark:bg-green-950/20"
                            }
                        >
                            <div className="flex items-start gap-4">
                                {result.label === "HATE" ? (
                                    <div className="p-3 rounded-full bg-red-500 text-white">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-full bg-green-500 text-white">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <CardTitle className="text-2xl mb-2">
                                        {result.label === "HATE"
                                            ? "⚠️ Hateful Content Detected"
                                            : "✓ No Hate Detected"}
                                    </CardTitle>
                                    <CardDescription>
                                        Analysis completed with{" "}
                                        {
                                            MODELS.find(
                                                (m) => m.id === selectedModel
                                            )?.name
                                        }
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Prediction
                                        </p>
                                        <p
                                            className={`text-2xl font-bold ${
                                                result.label === "HATE"
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                            }`}
                                        >
                                            {result.label}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Confidence
                                        </p>
                                        <p className="text-2xl font-bold text-primary">
                                            {(result.confidence * 100).toFixed(
                                                1
                                            )}
                                            %
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground mb-1">
                                            Model Used
                                        </p>
                                        <p className="text-lg font-bold text-foreground">
                                            {
                                                MODELS.find(
                                                    (m) =>
                                                        m.id === selectedModel
                                                )?.name.split(" + ")[0]
                                            }
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {result.text && (
                                <Card className="border-0 shadow-sm mb-6">
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Extracted Text
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-foreground italic">
                                            "{result.text}"
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="border-0 shadow-sm bg-accent/50">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Probability Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium">
                                                Hateful
                                            </span>
                                            <span className="font-semibold text-red-600">
                                                {(
                                                    result.probability_hateful *
                                                    100
                                                ).toFixed(1)}
                                                %
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded">
                                            <div
                                                className="h-3 bg-red-500 rounded"
                                                style={{
                                                    width: `${
                                                        result.probability_hateful *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium">
                                                Non-Hateful
                                            </span>
                                            <span className="font-semibold text-green-600">
                                                {(
                                                    (1 -
                                                        result.probability_hateful) *
                                                    100
                                                ).toFixed(1)}
                                                %
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded">
                                            <div
                                                className="h-3 bg-green-500 rounded"
                                                style={{
                                                    width: `${
                                                        (1 -
                                                            result.probability_hateful) *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                )}

                {/* Error */}
                {error && (
                    <Card className="shadow-professional border-0 ring-2 ring-red-500">
                        <CardHeader className="bg-red-50 dark:bg-red-950/20">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-red-500 text-white">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl mb-2 text-red-700 dark:text-red-400">
                                        Error Occurred
                                    </CardTitle>
                                    <CardDescription className="text-red-600 dark:text-red-300">
                                        {error}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                )}
            </div>
        </div>
    );
}
