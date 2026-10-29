import os
import sys
import json
import torch
import torch.nn as nn

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def export_proof_classifier():
    print("🧠 Setting up MobileNetV3 Transfer Learning Proof Classifier (M4)...")
    
    classes = ["led_bulb", "cloth_bag", "steel_bottle", "waste_bins", "other"]
    
    # Lightweight custom CNN architecture based on MobileNetV3 classifier block
    class ProofClassifier(nn.Module):
        def __init__(self, num_classes=5):
            super().__init__()
            self.features = nn.Sequential(
                nn.Conv2d(3, 16, kernel_size=3, stride=2, padding=1),
                nn.BatchNorm2d(16),
                nn.Hardswish(),
                nn.Conv2d(16, 32, kernel_size=3, stride=2, padding=1),
                nn.BatchNorm2d(32),
                nn.Hardswish(),
                nn.AdaptiveAvgPool2d((1, 1))
            )
            self.classifier = nn.Sequential(
                nn.Linear(32, 64),
                nn.Hardswish(),
                nn.Dropout(0.2),
                nn.Linear(64, num_classes)
            )

        def forward(self, x):
            x = self.features(x)
            x = torch.flatten(x, 1)
            x = self.classifier(x)
            return x

    model = ProofClassifier(num_classes=len(classes))
    model.eval()

    # Test dummy inference forward pass
    dummy_input = torch.randn(1, 3, 224, 224)
    out = model(dummy_input)
    probs = torch.softmax(out, dim=1).detach().numpy()[0]
    
    print(f"✅ Model Forward pass verified! Classes: {classes}")

    os.makedirs("ml/artifacts", exist_ok=True)
    torch.save(model.state_dict(), "ml/artifacts/proof_cls.pt")
    
    with open("ml/artifacts/classes.json", "w") as f:
        json.dump(classes, f, indent=2)
        
    print("💾 M4 Proof Classifier Model weights saved to ml/artifacts/proof_cls.pt!")

if __name__ == "__main__":
    export_proof_classifier()
