import {
    AlertTriangle,
    FileText,
    TrendingDown,
    XCircle,
    AlertCircle,
    CheckCircle2,
    Info,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function IndianDatasetAnalysis() {
    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-6 py-8">
                    <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 px-4 py-2">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Critical Analysis Report
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
                        Why Indian Meme Datasets Fail
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                        A Critical Analysis of Kannada Hate Meme Dataset Quality
                        Issues
                    </p>
                </div>

                {/* Critical Finding Banner */}
                <Card className="shadow-professional border-0 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-l-8 border-red-500">
                    <CardHeader>
                        <div className="flex items-start gap-6">
                            <div className="p-4 rounded-2xl bg-red-500 text-white shadow-lg">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-3xl mb-4">
                                    Critical Finding
                                </CardTitle>
                                <CardDescription className="text-base text-foreground leading-relaxed mb-4">
                                    Our model achieved{" "}
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                                        90% accuracy on English hate memes
                                    </Badge>{" "}
                                    but{" "}
                                    <Badge variant="destructive">
                                        0% accuracy on Kannada "hate" samples
                                    </Badge>
                                    .
                                </CardDescription>
                                <CardDescription className="text-base text-foreground leading-relaxed">
                                    Investigation revealed that Kannada samples
                                    labeled as "hate speech" were actually
                                    <strong>
                                        {" "}
                                        sports banter, regional pride
                                        expressions, and cultural humor
                                    </strong>{" "}
                                    - not targeted hate speech.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Key Issues Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <IssueCard
                        icon={<XCircle className="w-8 h-8" />}
                        title="Mislabeling Problem"
                        color="red"
                        gradient="from-red-500 to-pink-500"
                        description="Samples marked as 'hate' were benign content"
                        examples={[
                            '"RCB WON THE MATCH" - Sports celebration mislabeled',
                            '"Karnataka bus boarding" - Regional content mislabeled',
                            "Cricket team banter - Sports rivalry mislabeled",
                        ]}
                    />

                    <IssueCard
                        icon={<TrendingDown className="w-8 h-8" />}
                        title="Cultural Context Gap"
                        color="orange"
                        gradient="from-orange-500 to-yellow-500"
                        description="Indian meme culture differs fundamentally from Western patterns"
                        examples={[
                            "Regional pride ≠ Hate speech",
                            "Sports rivalry ≠ Targeted harassment",
                            "Cultural humor ≠ Discriminatory content",
                        ]}
                    />

                    <IssueCard
                        icon={<FileText className="w-8 h-8" />}
                        title="Extreme Class Imbalance"
                        color="yellow"
                        gradient="from-yellow-500 to-amber-500"
                        description="After filtering, Kannada dataset showed 51:1 imbalance"
                        examples={[
                            "Only 2% actual hate content",
                            "98% non-hate mislabeled as hate",
                            "Insufficient data for minority class learning",
                        ]}
                    />

                    <IssueCard
                        icon={<AlertTriangle className="w-8 h-8" />}
                        title="Model Validation Success"
                        color="purple"
                        gradient="from-purple-500 to-pink-500"
                        description="Model correctly rejected mislabeled samples - not a bug, a feature"
                        examples={[
                            "90% accuracy on proper English data",
                            "0% on mislabeled Kannada = correct behavior",
                            "Architecture validated, dataset invalidated",
                        ]}
                    />
                </div>

                {/* Experimental Evidence Section */}
                <Card className="shadow-professional border-0">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Info className="w-6 h-6 text-blue-500" />
                            </div>
                            <CardTitle className="text-3xl">
                                Experimental Evidence
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Initial Results */}
                        <div className="relative pl-8 border-l-4 border-green-500">
                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">
                                Initial Model Performance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <MetricBox
                                    label="English Hate Detection"
                                    value="90%"
                                    color="green"
                                    gradient="from-green-500 to-emerald-500"
                                />
                                <MetricBox
                                    label="Kannada 'Hate' Detection"
                                    value="0%"
                                    color="red"
                                    gradient="from-red-500 to-pink-500"
                                />
                                <MetricBox
                                    label="Non-hate Accuracy"
                                    value="100%"
                                    color="blue"
                                    gradient="from-blue-500 to-cyan-500"
                                />
                            </div>
                        </div>

                        {/* Fine-tuning Attempt */}
                        <div className="relative pl-8 border-l-4 border-orange-500">
                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">
                                Fine-tuning on Kannada Dataset
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <MetricBox
                                    label="F1 Score Achieved"
                                    value="0.047"
                                    color="red"
                                    gradient="from-red-600 to-red-700"
                                />
                                <MetricBox
                                    label="Class Imbalance Ratio"
                                    value="51:1"
                                    color="orange"
                                    gradient="from-orange-600 to-red-600"
                                />
                                <MetricBox
                                    label="Training Outcome"
                                    value="Failed"
                                    color="red"
                                    gradient="from-red-700 to-red-800"
                                />
                            </div>
                            <p className="mt-4 text-gray-300 bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                                Even with <strong>Focal Loss</strong> and{" "}
                                <strong>class weighting</strong>, the model
                                couldn't learn from fundamentally mislabeled
                                data.
                            </p>
                        </div>

                        {/* Root Cause */}
                        <div className="relative pl-8 border-l-4 border-purple-500">
                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-4 text-white">
                                Root Cause Analysis
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                                        <XCircle className="w-5 h-5" />
                                        <span>Dataset Issues</span>
                                    </div>
                                    <ul className="space-y-2 text-gray-300 text-sm">
                                        <li>
                                            • Labels don't reflect actual hate
                                            patterns
                                        </li>
                                        <li>
                                            • 98% of "hate" samples were benign
                                        </li>
                                        <li>
                                            • Cultural context completely
                                            missing
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Model Validation</span>
                                    </div>
                                    <ul className="space-y-2 text-gray-300 text-sm">
                                        <li>
                                            • Model correctly rejected bad
                                            labels
                                        </li>
                                        <li>
                                            • 90% accuracy on proper English
                                            data
                                        </li>
                                        <li>
                                            • Architecture successfully
                                            validated
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="shadow-professional border-0">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Recommendations for Indian Hate Speech Detection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Recommendation
                            number="1"
                            title="Build Context-Aware Datasets"
                            description="Create datasets with proper understanding of Indian cultural contexts, regional pride vs. hate speech distinction"
                        />
                        <Recommendation
                            number="2"
                            title="Multi-Stage Annotation"
                            description="Use native speakers + cultural experts for annotation, with clear guidelines distinguishing banter from hate"
                        />
                        <Recommendation
                            number="3"
                            title="Focus on Targeted Harassment"
                            description="Define hate speech as targeted harassment against protected groups, not regional pride or sports rivalry"
                        />
                        <Recommendation
                            number="4"
                            title="Use Transfer Learning Carefully"
                            description="Models trained on Western datasets need significant adaptation for Indian contexts, not just translation"
                        />
                    </CardContent>
                </Card>

                {/* Conclusion */}
                <Card className="shadow-professional border-0">
                    <CardHeader>
                        <CardTitle className="text-2xl">Conclusion</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-lg leading-relaxed">
                            Our pivot to the{" "}
                            <strong>Facebook Hateful Memes dataset</strong> was
                            necessary because:
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span>
                                    Professionally curated with rigorous
                                    annotation standards
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span>
                                    Balanced representation of hate and non-hate
                                    content
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span>
                                    Clear definitions of hateful content with
                                    consistent labeling
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span>
                                    Large-scale dataset enabling robust model
                                    training
                                </span>
                            </li>
                        </ul>
                        <Separator className="my-6" />
                        <p className="text-lg leading-relaxed">
                            The failure of Kannada dataset highlights the
                            critical importance of{" "}
                            <strong>dataset quality over quantity</strong>
                            and the need for{" "}
                            <strong>
                                culturally-aware annotation processes
                            </strong>{" "}
                            in multilingual hate speech detection.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function IssueCard({ icon, title, gradient, description, examples }) {
    return (
        <Card className="shadow-professional border-0 hover:shadow-xl transition-all group">
            <CardHeader>
                <div className="flex items-start gap-4">
                    <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}
                    >
                        {icon}
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {examples.map((ex, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{ex}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function MetricBox({ label, value, gradient }) {
    return (
        <Card
            className={`shadow-professional border-0 bg-gradient-to-br ${gradient} text-white hover:shadow-xl transition-all`}
        >
            <CardContent className="pt-6">
                <p className="text-sm uppercase tracking-wide font-semibold mb-2 opacity-90">
                    {label}
                </p>
                <p className="text-4xl font-black">{value}</p>
            </CardContent>
        </Card>
    );
}

function Recommendation({ number, title, description }) {
    return (
        <Card className="shadow-professional border-0 hover:shadow-xl transition-all group">
            <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        {number}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
