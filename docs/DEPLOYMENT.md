# Deployment Guide

## 1. Prerequisites

### 1.1 System Requirements
- CPU: 4+ cores
- RAM: 16GB minimum
- Storage: 50GB+ for models and data
- OS: macOS/Linux
- Docker (optional)

### 1.2 Required Software
- Python 3.9+
- Ollama
- Tesseract OCR
- Node.js 16+ (for UI)
- Git

## 2. Installation Steps

### 2.1 Base Installation

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

### 2.2 Ollama Setup

1. Install Ollama:
```bash
# macOS
curl https://ollama.ai/install.sh | sh

# Linux
curl https://ollama.ai/install.sh | sh
```

2. Download required models:
```bash
ollama pull mistral
ollama pull codellama
```

### 2.3 OCR Setup

1. Install Tesseract:
```bash
# macOS
brew install tesseract

# Linux
sudo apt-get install tesseract-ocr
```

2. Install language data:
```bash
# macOS
brew install tesseract-lang

# Linux
sudo apt-get install tesseract-ocr-eng
```

## 3. Configuration

### 3.1 Environment Setup

1. Create `.env` file:
```bash
cp .env.example .env
```

2. Configure environment variables:
```env
# LLM Configuration
OLLAMA_HOST=http://localhost:11434
DEFAULT_MODEL=mistral

# Database Configuration
CHROMA_DB_PATH=/path/to/vector/db
SQLITE_DB_PATH=/path/to/sqlite/db

# Integration Configuration
NAS_HOST=nas.local
NAS_SHARE=documents
NAS_USERNAME=user
NAS_PASSWORD=password

EMAIL_SERVER=imap.gmail.com
EMAIL_PORT=993
EMAIL_USERNAME=user@gmail.com
EMAIL_PASSWORD=app_password

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

### 3.2 NAS Mount

1. Create mount point:
```bash
sudo mkdir -p /mnt/nas
```

2. Add to fstab:
```bash
# /etc/fstab
//nas.local/documents /mnt/nas cifs credentials=/root/.nas_credentials,iocharset=utf8,file_mode=0777,dir_mode=0777 0 0
```

3. Create credentials file:
```bash
# /root/.nas_credentials
username=user
password=password
```

4. Mount NAS:
```bash
sudo mount -a
```

## 4. Docker Deployment

### 4.1 Build Docker Image

1. Build the image:
```bash
docker build -t personal-ai-assistant .
```

2. Create Docker network:
```bash
docker network create ai-assistant-net
```

### 4.2 Run with Docker Compose

1. Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  ai-assistant:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
      - /mnt/nas:/mnt/nas
    environment:
      - OLLAMA_HOST=http://ollama:11434
    depends_on:
      - ollama
    networks:
      - ai-assistant-net

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - ai-assistant-net

volumes:
  ollama_data:

networks:
  ai-assistant-net:
    driver: bridge
```

2. Start services:
```bash
docker-compose up -d
```

## 5. Service Management

### 5.1 Systemd Service

1. Create service file:
```ini
# /etc/systemd/system/ai-assistant.service
[Unit]
Description=Personal AI Assistant
After=network.target

[Service]
User=ai-assistant
Group=ai-assistant
WorkingDirectory=/opt/ai-assistant
Environment=PYTHONPATH=/opt/ai-assistant
ExecStart=/opt/ai-assistant/venv/bin/python -m src.main
Restart=always

[Install]
WantedBy=multi-user.target
```

2. Enable and start service:
```bash
sudo systemctl enable ai-assistant
sudo systemctl start ai-assistant
```

### 5.2 Monitoring

1. Check service status:
```bash
sudo systemctl status ai-assistant
```

2. View logs:
```bash
sudo journalctl -u ai-assistant -f
```

## 6. Backup and Recovery

### 6.1 Backup Strategy

1. Database backup:
```bash
# Backup ChromaDB
tar -czf chroma_backup.tar.gz /path/to/vector/db

# Backup SQLite
sqlite3 /path/to/sqlite/db ".backup '/path/to/backup/db'"
```

2. Configuration backup:
```bash
tar -czf config_backup.tar.gz .env config/
```

### 6.2 Recovery Procedure

1. Restore database:
```bash
# Restore ChromaDB
tar -xzf chroma_backup.tar.gz -C /path/to/vector/db

# Restore SQLite
sqlite3 /path/to/sqlite/db ".restore '/path/to/backup/db'"
```

2. Restore configuration:
```bash
tar -xzf config_backup.tar.gz
```

## 7. Security Considerations

### 7.1 Access Control

1. Set up firewall:
```bash
# Allow required ports
sudo ufw allow 8000/tcp  # API
sudo ufw allow 11434/tcp # Ollama
```

2. Configure API authentication:
```bash
# Generate API key
openssl rand -hex 32 > api_key.txt
```

### 7.2 Data Protection

1. Enable encryption:
```bash
# Generate encryption key
openssl rand -hex 32 > encryption_key.txt
```

2. Configure secure storage:
```bash
# Set up encrypted volume
sudo cryptsetup luksFormat /dev/sdX
sudo cryptsetup luksOpen /dev/sdX encrypted_volume
```

## 8. Troubleshooting

### 8.1 Common Issues

1. Ollama connection issues:
```bash
# Check Ollama service
curl http://localhost:11434/api/tags

# Restart Ollama
sudo systemctl restart ollama
```

2. NAS mount issues:
```bash
# Check mount
mount | grep nas

# Remount
sudo mount -a
```

### 8.2 Log Analysis

1. Check application logs:
```bash
tail -f /var/log/ai-assistant/app.log
```

2. Check system logs:
```bash
dmesg | grep -i error
```

## 9. Performance Tuning

### 9.1 Resource Optimization

1. Adjust Ollama parameters:
```bash
# /etc/ollama/config.json
{
  "num_threads": 4,
  "gpu_layers": 32
}
```

2. Configure ChromaDB:
```python
# config/chroma_config.py
CHROMA_SETTINGS = {
    "anonymized_telemetry": False,
    "allow_reset": True,
    "is_persistent": True
}
```

### 9.2 Monitoring Setup

1. Install monitoring tools:
```bash
pip install prometheus-client
```

2. Configure metrics:
```python
# src/monitoring/metrics.py
from prometheus_client import start_http_server, Counter, Gauge

# Define metrics
request_count = Counter('ai_assistant_requests_total', 'Total requests')
response_time = Gauge('ai_assistant_response_time_seconds', 'Response time')
```

## 10. Scaling Considerations

### 10.1 Horizontal Scaling

1. Load balancer setup:
```nginx
# /etc/nginx/conf.d/ai-assistant.conf
upstream ai_assistant {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
}

server {
    listen 80;
    server_name ai-assistant.local;

    location / {
        proxy_pass http://ai_assistant;
    }
}
```

2. Multiple instances:
```bash
# Start additional instances
python -m src.main --port 8001
python -m src.main --port 8002
```

### 10.2 Resource Scaling

1. Memory optimization:
```python
# config/memory_config.py
MEMORY_SETTINGS = {
    "max_memory": "16GB",
    "cache_size": "4GB"
}
```

2. CPU optimization:
```python
# config/processing_config.py
PROCESSING_SETTINGS = {
    "max_workers": 4,
    "batch_size": 32
}
``` 