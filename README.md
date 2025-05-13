# Personal AI Assistant

A local-first, privacy-focused AI system that integrates with personal data sources (NAS, email, social media) to provide intelligent assistance and automation.

## Features

- Local LLM using Ollama
- Document processing and OCR
- Email integration and summarization
- Social media monitoring
- Semantic memory system
- Task automation
- Privacy-focused design

## Prerequisites

- Python 3.9+
- Ollama
- Tesseract OCR
- Node.js 16+ (for UI)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/personal-ai-assistant.git
cd personal-ai-assistant
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Install Ollama:
```bash
# macOS
curl https://ollama.ai/install.sh | sh

# Linux
curl https://ollama.ai/install.sh | sh
```

5. Download required models:
```bash
ollama pull mistral
ollama pull codellama
```

6. Install Tesseract:
```bash
# macOS
brew install tesseract

# Linux
sudo apt-get install tesseract-ocr
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
- Set up NAS credentials
- Configure email settings
- Add social media API keys
- Set security keys

3. Configure the system in `config/config.yaml`

## Usage

1. Start the application:
```bash
python -m src.main
```

2. The system will:
- Initialize the LLM engine
- Set up the memory system
- Start the agent system
- Begin monitoring configured services

## Development

### Project Structure
```
project/
├── src/
│   ├── core/           # Core LLM and agent functionality
│   ├── integrations/   # External service integrations
│   ├── memory/         # Memory management system
│   ├── processing/     # Document and data processing
│   └── api/           # API and interface implementations
├── tests/             # Test suite
├── docs/              # Documentation
└── config/           # Configuration files
```

### Running Tests
```bash
pytest tests/
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security

- All data is processed locally
- No data is sent to external services without explicit consent
- API keys and credentials are stored securely
- Optional encryption for sensitive data

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue in the GitHub repository. 