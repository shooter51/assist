import uvicorn
import logging
from .config import load_config, get_api_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    # Load configuration
    config = load_config()
    api_config = get_api_config(config)
    
    # Start server
    uvicorn.run(
        "api.main:app",
        host=api_config['host'],
        port=api_config['port'],
        reload=api_config['debug']
    )

if __name__ == "__main__":
    main() 