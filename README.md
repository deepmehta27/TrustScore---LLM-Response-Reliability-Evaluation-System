# TrustScore - AI Model Reliability Evaluation Dashboard

<div align="center">

**A professional AI evaluation platform that assesses LLM responses across multiple reliability dimensions and generates a unified TrustScore (0-100) with detailed explanations.**

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## 🎯 Overview

TrustScore is a comprehensive evaluation system that acts as a **"credit score for AI responses"**. It evaluates LLM outputs across five critical reliability dimensions, providing actionable insights for responsible AI deployment in healthcare, finance, education, and customer support applications.

### The Problem

Modern LLMs can be:
- **Confident but wrong** (hallucinations)
- **Biased** or stereotyping
- **Toxic** or unsafe in sensitive domains
- **Misaligned** with user intent

### The Solution

TrustScore provides:
- ✅ **Multi-dimensional evaluation** across 5 reliability metrics
- ✅ **Unified TrustScore** (0-100) for easy comparison
- ✅ **Human-readable explanations** of trustworthiness
- ✅ **Side-by-side model comparison** to choose the best model
- ✅ **Industry-specific presets** for domain-aware evaluation

---

## ✨ Key Features

### 🔍 Five Reliability Metrics

| Metric | Description | Method |
|-------|-------------|--------|
| **Faithfulness** | Grounding in provided context | RAGAS + token-overlap fallback |
| **Relevance** | Alignment with original query | RAGAS + similarity heuristic |
| **Bias** | Demographic bias & stereotyping | GPT-assisted probe + keyword scan |
| **Toxicity** | Harmful content detection | OpenAI Moderation API + keyword fallback |
| **Factual Accuracy** | Claim verification vs context | GPT fact-check + token overlap |

### 🤖 Supported AI Models

TrustScore supports evaluation across multiple leading AI providers:

#### OpenAI Models
- **GPT-4.1** - Advanced reasoning and analysis
- **GPT-5.1** - Latest generation with enhanced capabilities

#### Google Models
- **Gemini 2.5 Flash** - Fast and efficient responses

#### OpenRouter Models
- **DeepSeek Chat** - High-performance open-source alternative

### 🎨 Professional Dashboard

- **Modern UI Design** with WCAG AA contrast compliance
- **Visual hierarchy** with color-coded TrustScores
- **Summary statistics** cards for quick insights
- **Expandable model responses** for detailed review
- **Comparison tables** with winner highlighting
- **Loading states** and smooth animations
- **Responsive design** for all devices

### ⚡ Performance Features

- **Parallel evaluation** - All metrics run concurrently
- **Async I/O** - Non-blocking API calls
- **Fast responses** - Optimized for real-time evaluation
- **Zero database overhead** - JSON file storage for simplicity

### 🏥 Industry Presets

| Preset | Focus | Use Case |
|--------|-------|----------|
| **Healthcare** | Faithfulness & Safety | Medical advice, patient information |
| **Finance** | Bias & Factual Accuracy | Investment advice, financial planning |
| **General** | Balanced evaluation | General-purpose applications |

### 📊 Built-in Demo Scenarios

Quick-start demos for common use cases:
- **Healthcare**: Stage 2 hypertension treatment recommendations
- **Finance**: Cryptocurrency investment risk assessment
- **Customer Support**: Password reset flow guidance

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Input Form   │  │ Score Cards  │  │ Comparison   │       │
│  │              │  │              │  │ Table        │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTP/REST API
┌───────────────────────────▼─────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Model Response Generation                   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │    │
│  │  │ OpenAI   │ │Anthropic │ │OpenRouter│          │    │
│  │  │          │ │          │ │          │          │    │
│  │  └──────────┘ └──────────┘ └──────────┘          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Parallel Metric Evaluation                  │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │    │
│  │  │Faith │ │Relv  │ │Bias  │ │Toxic │ │Fact  │   │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         TrustScore Calculation (0-100)              │    │
│  │         Weighted by Industry Presets                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** for backend
- **Node.js 18+** for frontend
- **API Keys** for your chosen models (see [Configuration](#-configuration))

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/deepmehta27/TrustScore---LLM-Response-Reliability-Evaluation-System.git
cd TrustScore---LLM-Response-Reliability-Evaluation-System
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp env.example .env

# Edit .env and add your API keys (see Configuration section)
# OPENROUTER_API_KEY=sk-or-v1-...
# ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
# GEMINI_API_KEY=...

# Verify environment setup
python check_env.py

# Start the backend server
uvicorn main:app --reload --port 8000
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (if needed)
# BACKEND_URL=http://localhost:8000

# Start the development server
npm run dev
```

#### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory with your API keys:

```env
# Required: At least one API key for model evaluation

# OpenAI API Key (for GPT-4.1, GPT-5.1)
OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic API Key (for Claude 3.5 Sonnet)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# OpenRouter API Key (for DeepSeek Chat)
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key-here

# Google/Gemini API Key (for Gemini models)
GEMINI_API_KEY=your-gemini-key-here
# OR
GOOGLE_API_KEY=your-google-key-here

# Optional: Site information for OpenRouter rankings
SITE_URL=http://localhost:3000
SITE_NAME=TrustScore
```

### Verifying Configuration

Use the built-in verification script:

```bash
cd backend
python check_env.py
```

This will show you which API keys are detected and which are missing.

---

## 📖 Usage Guide

### Basic Evaluation Workflow

1. **Choose a Demo Preset** (optional)
   - Click Healthcare, Finance, or Customer Support tabs
   - This auto-fills query and context examples

2. **Enter Your Query**
   - Type or paste the question you want to evaluate
   - Add optional context for better evaluation

3. **Select Industry Preset**
   - Choose Healthcare, Finance, or General
   - This adjusts metric weights for domain-specific evaluation

4. **Select Models to Compare**
   - Check the models you want to evaluate
   - You can compare multiple models simultaneously

5. **Click "Compare Models"**
   - Wait for evaluation to complete
   - View results in scorecards and comparison table

### Understanding Results

- **TrustScore (0-100)**: Overall reliability score
  - 🟢 **80-100**: High Trust (Green)
  - 🟡 **60-79**: Moderate Trust (Yellow)
  - 🔴 **0-59**: Low Trust (Red)

- **Metric Breakdown**: Individual scores for each dimension
- **Model Response**: The actual AI-generated response
- **Explanation**: Human-readable summary of the evaluation

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Python 3.10+** - Async/await support
- **RAGAS** - Faithfulness & Relevance metrics
- **OpenAI SDK** - GPT models & moderation
- **Anthropic SDK** - Claude models
- **httpx** - Async HTTP client for OpenRouter
- **python-dotenv** - Environment variable management

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Lucide React** - Icon library

### Storage
- **JSON file** - Simple file-based storage (`backend/data/results.json`)

---

## 📁 Project Structure

```
TrustScore/
├── backend/
│   ├── main.py                 # FastAPI app & routes
│   ├── models.py               # Pydantic schemas
│   ├── scorer.py               # Presets & score calculation
│   ├── check_env.py            # Environment verification
│   ├── env.example             # Environment template
│   ├── requirements.txt        # Python dependencies
│   ├── data/
│   │   └── results.json        # Evaluation history
│   └── evaluators/
│       ├── __init__.py
│       ├── faithfulness.py    # Context grounding metric
│       ├── relevance.py        # Query alignment metric
│       ├── bias.py             # Bias detection metric
│       ├── toxicity.py         # Safety detection metric
│       └── factual.py          # Fact verification metric
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main page
│   │   ├── globals.css         # Global styles
│   │   └── api/
│   │       ├── evaluate/       # Evaluation endpoint
│   │       └── compare/        # Comparison endpoint
│   ├── components/
│   │   ├── InputForm.tsx       # Query input & model selection
│   │   ├── ScoreCard.tsx       # Individual model results
│   │   ├── ComparisonTable.tsx # Side-by-side comparison
│   │   ├── SummaryStats.tsx    # Summary statistics
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── cn.ts               # Utility functions
│   │   └── utils.ts            # Helper functions
│   └── package.json            # Node dependencies
│
└── README.md                   # This file
```

---

## 🔬 Reliability Metrics Explained

### Faithfulness
Measures how well the response is grounded in the provided context. Uses RAGAS Faithfulness metric with token-overlap fallback.

### Relevance
Evaluates alignment between the response and the original query. Uses RAGAS ResponseRelevancy with similarity heuristic fallback.

### Bias
Detects demographic bias and stereotyping patterns. Uses GPT-assisted probes to test for differential treatment across demographic variants.

### Toxicity
Identifies harmful, unsafe, or inappropriate content. Uses OpenAI Moderation API with keyword-based fallback.

### Factual Accuracy
Verifies claims against provided context. Uses GPT fact-checking with token overlap fallback.

---

## 🚢 Deployment

### Backend Deployment

Deploy FastAPI with Uvicorn/Gunicorn on:
- **Render** - Easy Python hosting
- **Railway** - Simple deployment
- **Azure App Service** - Enterprise hosting
- **Google Cloud Run** - Serverless option
- **AWS Elastic Beanstalk** - AWS integration

### Frontend Deployment

Deploy Next.js on:
- **Vercel** - Recommended (Next.js creators)
- **Netlify** - Simple static hosting
- **AWS Amplify** - AWS integration

### Environment Variables

Set production environment variables:
```bash
# Backend
OPENROUTER_API_KEY=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...

# Frontend
BACKEND_URL=https://your-backend-url.com
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **RAGAS** - For faithfulness and relevance metrics
- **OpenAI** - For GPT models and moderation API
- **Anthropic** - For Claude models
- **OpenRouter** - For model access aggregation
- **shadcn/ui** - For beautiful UI components

---

## 📧 Support

For issues, questions, or contributions, please open an issue on [GitHub](https://github.com/deepmehta27/TrustScore---LLM-Response-Reliability-Evaluation-System).

---

<div align="center">

**Built with ❤️ for Responsible AI**

</div>

