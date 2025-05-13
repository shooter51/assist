from typing import Dict, List, Any, Optional
import ollama
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class ModelConfig:
    model_name: str
    temperature: float = 0.7
    context_window: int = 4096
    top_p: float = 0.9
    top_k: int = 40

class ContextManager:
    def __init__(self, max_tokens: int = 4096):
        self.max_tokens = max_tokens
        self.context: List[Dict[str, str]] = []
    
    def add_to_context(self, role: str, content: str) -> None:
        self.context.append({"role": role, "content": content})
        self._trim_context()
    
    def _trim_context(self) -> None:
        # Simple implementation - can be enhanced with token counting
        if len(self.context) > 10:  # Arbitrary limit, should be based on token count
            self.context = self.context[-10:]
    
    def get_context(self) -> List[Dict[str, str]]:
        return self.context
    
    def clear_context(self) -> None:
        self.context = []

class LLMEngine:
    def __init__(self, config: ModelConfig):
        self.config = config
        self.context_manager = ContextManager(max_tokens=config.context_window)
        self._initialize_model()
    
    def _initialize_model(self) -> None:
        try:
            # Verify model is available
            models = ollama.list()
            if self.config.model_name not in [model['name'] for model in models['models']]:
                logger.info(f"Model {self.config.model_name} not found, pulling...")
                ollama.pull(self.config.model_name)
        except Exception as e:
            logger.error(f"Failed to initialize model: {str(e)}")
            raise
    
    def generate_response(self, prompt: str, context: Optional[List[Dict]] = None) -> str:
        try:
            # Prepare messages
            messages = []
            if context:
                messages.extend(context)
            messages.append({"role": "user", "content": prompt})
            
            # Generate response
            response = ollama.chat(
                model=self.config.model_name,
                messages=messages,
                options={
                    "temperature": self.config.temperature,
                    "top_p": self.config.top_p,
                    "top_k": self.config.top_k
                }
            )
            
            # Update context
            self.context_manager.add_to_context("user", prompt)
            self.context_manager.add_to_context("assistant", response['message']['content'])
            
            return response['message']['content']
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise
    
    def switch_model(self, new_model: str) -> None:
        try:
            self.config.model_name = new_model
            self._initialize_model()
            self.context_manager.clear_context()
        except Exception as e:
            logger.error(f"Error switching model: {str(e)}")
            raise
    
    def get_available_models(self) -> List[str]:
        try:
            models = ollama.list()
            return [model['name'] for model in models['models']]
        except Exception as e:
            logger.error(f"Error getting available models: {str(e)}")
            raise 