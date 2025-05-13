import asyncio
import logging
import os
from typing import Dict, Any
import yaml
from dotenv import load_dotenv
from core.llm_engine import LLMEngine, ModelConfig
from memory.memory_system import MemorySystem
from core.agent_system import AgentSystem, Task
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def load_config() -> Dict[str, Any]:
    """Load configuration from YAML file"""
    config_path = os.getenv('CONFIG_PATH', 'config/config.yaml')
    try:
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    except Exception as e:
        logger.error(f"Error loading config: {str(e)}")
        raise

async def main():
    # Load environment variables
    load_dotenv()
    
    # Load configuration
    config = load_config()
    
    try:
        # Initialize LLM Engine
        llm_config = ModelConfig(
            model_name=config['llm']['model'],
            temperature=config['llm']['temperature'],
            context_window=config['llm']['context_window']
        )
        llm_engine = LLMEngine(llm_config)
        
        # Initialize Memory System
        memory_system = MemorySystem(config['memory'])
        
        # Initialize Agent System
        agent_system = AgentSystem(llm_engine, memory_system)
        
        # Start the agent system
        await agent_system.start()
        
        # Example task
        task = Task(
            id=str(uuid.uuid4()),
            type="document",
            parameters={
                "action": "process",
                "file_path": "/path/to/document.pdf"
            }
        )
        
        # Execute task
        result = await agent_system.execute_task(task)
        logger.info(f"Task result: {result}")
        
        # Keep the application running
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        await agent_system.stop()
    except Exception as e:
        logger.error(f"Error in main: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 