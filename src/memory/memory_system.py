from typing import Dict, List, Any, Optional
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import logging
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class MemorySystem:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.vector_db = self._initialize_vector_db()
        self.embedding_model = self._initialize_embedding_model()
        
    def _initialize_vector_db(self) -> chromadb.Client:
        try:
            return chromadb.Client(Settings(
                persist_directory=self.config.get('vector_db_path', './data/vector_db'),
                anonymized_telemetry=False
            ))
        except Exception as e:
            logger.error(f"Failed to initialize vector database: {str(e)}")
            raise
    
    def _initialize_embedding_model(self) -> SentenceTransformer:
        try:
            return SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            logger.error(f"Failed to initialize embedding model: {str(e)}")
            raise
    
    def store_memory(self, content: str, metadata: Optional[Dict] = None) -> str:
        try:
            # Generate embedding
            embedding = self.embedding_model.encode(content)
            
            # Prepare metadata
            if metadata is None:
                metadata = {}
            metadata['timestamp'] = datetime.utcnow().isoformat()
            
            # Store in vector database
            collection = self.vector_db.get_or_create_collection("memories")
            result = collection.add(
                embeddings=[embedding.tolist()],
                documents=[content],
                metadatas=[metadata],
                ids=[f"mem_{datetime.utcnow().timestamp()}"]
            )
            
            return result[0]  # Return the ID of the stored memory
        except Exception as e:
            logger.error(f"Error storing memory: {str(e)}")
            raise
    
    def retrieve_memory(self, query: str, limit: int = 5) -> List[Dict]:
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query)
            
            # Search in vector database
            collection = self.vector_db.get_collection("memories")
            results = collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=limit
            )
            
            # Format results
            memories = []
            for i in range(len(results['ids'][0])):
                memories.append({
                    'id': results['ids'][0][i],
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'similarity': results['distances'][0][i]
                })
            
            return memories
        except Exception as e:
            logger.error(f"Error retrieving memory: {str(e)}")
            raise
    
    def update_memory(self, memory_id: str, content: str, metadata: Optional[Dict] = None) -> None:
        try:
            # Generate new embedding
            embedding = self.embedding_model.encode(content)
            
            # Update metadata
            if metadata is None:
                metadata = {}
            metadata['updated_at'] = datetime.utcnow().isoformat()
            
            # Update in vector database
            collection = self.vector_db.get_collection("memories")
            collection.update(
                ids=[memory_id],
                embeddings=[embedding.tolist()],
                documents=[content],
                metadatas=[metadata]
            )
        except Exception as e:
            logger.error(f"Error updating memory: {str(e)}")
            raise
    
    def delete_memory(self, memory_id: str) -> None:
        try:
            collection = self.vector_db.get_collection("memories")
            collection.delete(ids=[memory_id])
        except Exception as e:
            logger.error(f"Error deleting memory: {str(e)}")
            raise
    
    def get_memory_by_id(self, memory_id: str) -> Optional[Dict]:
        try:
            collection = self.vector_db.get_collection("memories")
            result = collection.get(ids=[memory_id])
            
            if not result['ids']:
                return None
            
            return {
                'id': result['ids'][0],
                'content': result['documents'][0],
                'metadata': result['metadatas'][0]
            }
        except Exception as e:
            logger.error(f"Error getting memory by ID: {str(e)}")
            raise 