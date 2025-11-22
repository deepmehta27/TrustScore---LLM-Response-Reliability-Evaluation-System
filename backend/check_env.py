#!/usr/bin/env python3
"""Quick script to verify .env file configuration"""
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    print("❌ python-dotenv not installed. Run: pip install python-dotenv")
    exit(1)

# Load .env file
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Found .env file at: {env_path}")
else:
    print(f"❌ .env file not found at: {env_path}")
    print("   Please create backend/.env file with your API keys")
    exit(1)

# Check each API key
print("\n📋 API Key Status:")
print("-" * 50)

keys = {
    "OPENAI_API_KEY": "OpenAI (GPT models)",
    "GEMINI_API_KEY": "Google Gemini",
    "GOOGLE_API_KEY": "Google (alternative)",
    "OPENROUTER_API_KEY": "OpenRouter (DeepSeek)",
    "ANTHROPIC_API_KEY": "Anthropic (Claude)",
}

all_present = True
for key, description in keys.items():
    value = os.getenv(key)
    if value:
        # Show first 10 chars and last 4 chars for verification
        masked = f"{value[:10]}...{value[-4:]}" if len(value) > 14 else "***"
        print(f"✅ {key:25} {description:30} ({masked})")
    else:
        print(f"❌ {key:25} {description:30} (NOT SET)")
        all_present = False

print("-" * 50)
if all_present:
    print("\n✅ All API keys are set!")
else:
    print("\n⚠️  Some API keys are missing. Add them to backend/.env file")
    print("\nExample .env file:")
    print("OPENROUTER_API_KEY=sk-or-v1-...")
    print("ANTHROPIC_API_KEY=sk-ant-...")
    print("OPENAI_API_KEY=sk-...")

