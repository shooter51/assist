from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import asyncio
import logging
from datetime import datetime
import json

from ..integrations.nas_integration import NASIntegration
from ..integrations.email_integration import EmailIntegration
from ..integrations.social_media_integration import SocialMediaIntegration
from ..core.llm_engine import LLMEngine, ModelConfig
from ..memory.memory_system import MemorySystem

logger = logging.getLogger(__name__)

app = FastAPI(title="Personal AI Assistant API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this appropriately in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Dependency injection
async def get_nas_integration():
    # Initialize with config from environment
    config = {
        "host": "nas.local",
        "share": "documents",
        "mount_point": "/mnt/nas",
        "username": "user",
        "password": "pass"
    }
    nas = NASIntegration(config)
    await nas.mount_share()
    try:
        yield nas
    finally:
        await nas.unmount_share()

async def get_email_integration():
    config = {
        "server": "imap.gmail.com",
        "port": 993,
        "username": "user@gmail.com",
        "password": "pass",
        "use_ssl": True
    }
    email = EmailIntegration(config)
    await email.connect()
    try:
        yield email
    finally:
        await email.disconnect()

async def get_social_media_integration():
    config = {
        "twitter": {
            "api_key": "your_api_key",
            "api_secret": "your_api_secret",
            "access_token": "your_access_token",
            "access_token_secret": "your_access_token_secret"
        },
        "facebook": {
            "access_token": "your_facebook_token"
        }
    }
    return SocialMediaIntegration(config)

# NAS endpoints
@app.get("/nas/files/{path:path}")
async def list_files(
    path: str,
    nas: NASIntegration = Depends(get_nas_integration)
):
    try:
        files = await nas.list_files(path)
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/nas/file/{path:path}")
async def read_file(
    path: str,
    nas: NASIntegration = Depends(get_nas_integration)
):
    try:
        content = await nas.read_file(path)
        return {"content": content.decode()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/nas/file/{path:path}")
async def write_file(
    path: str,
    content: str,
    nas: NASIntegration = Depends(get_nas_integration)
):
    try:
        success = await nas.write_file(path, content.encode())
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/nas/file/{path:path}")
async def delete_file(
    path: str,
    nas: NASIntegration = Depends(get_nas_integration)
):
    try:
        success = await nas.delete_file(path)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Email endpoints
@app.get("/email/messages")
async def get_emails(
    limit: int = 20,
    since: Optional[datetime] = None,
    email: EmailIntegration = Depends(get_email_integration)
):
    try:
        emails = await email.fetch_emails(since=since, limit=limit)
        return {"emails": emails}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/email/messages/{message_id}/read")
async def mark_email_read(
    message_id: str,
    email: EmailIntegration = Depends(get_email_integration)
):
    try:
        success = await email.mark_as_read(message_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Social Media endpoints
@app.get("/social/twitter/timeline")
async def get_twitter_timeline(
    count: int = 20,
    since_id: Optional[str] = None,
    social: SocialMediaIntegration = Depends(get_social_media_integration)
):
    try:
        tweets = await social.get_twitter_timeline(count=count, since_id=since_id)
        return {"tweets": tweets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/social/twitter/tweet")
async def post_tweet(
    text: str,
    social: SocialMediaIntegration = Depends(get_social_media_integration)
):
    try:
        tweet = await social.post_tweet(text)
        return tweet
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/social/facebook/feed")
async def get_facebook_feed(
    limit: int = 20,
    since: Optional[datetime] = None,
    social: SocialMediaIntegration = Depends(get_social_media_integration)
):
    try:
        posts = await social.get_facebook_feed(limit=limit, since=since)
        return {"posts": posts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/social/facebook/post")
async def post_facebook_status(
    message: str,
    social: SocialMediaIntegration = Depends(get_social_media_integration)
):
    try:
        post = await social.post_facebook_status(message)
        return post
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Process incoming messages if needed
            await manager.broadcast(f"Message received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Start monitoring tasks
@app.on_event("startup")
async def startup_event():
    # Initialize integrations
    nas = NASIntegration({
        "host": "nas.local",
        "share": "documents",
        "mount_point": "/mnt/nas",
        "username": "user",
        "password": "pass"
    })
    
    email = EmailIntegration({
        "server": "imap.gmail.com",
        "port": 993,
        "username": "user@gmail.com",
        "password": "pass",
        "use_ssl": True
    })
    
    social = SocialMediaIntegration({
        "twitter": {
            "api_key": "your_api_key",
            "api_secret": "your_api_secret",
            "access_token": "your_access_token",
            "access_token_secret": "your_access_token_secret"
        },
        "facebook": {
            "access_token": "your_facebook_token"
        }
    })
    
    # Start monitoring
    await nas.mount_share()
    await email.connect()
    
    async def nas_callback(event_type: str, path: str):
        await manager.broadcast(json.dumps({
            "type": "nas_event",
            "event": event_type,
            "path": path
        }))
    
    async def email_callback(email_data: Dict[str, Any]):
        await manager.broadcast(json.dumps({
            "type": "email_event",
            "data": email_data
        }))
    
    async def social_callback(platform: str, data: Dict[str, Any]):
        await manager.broadcast(json.dumps({
            "type": "social_event",
            "platform": platform,
            "data": data
        }))
    
    # Start monitoring tasks
    await nas.start_monitoring(nas_callback)
    await email.start_monitoring(email_callback)
    await social.start_monitoring(social_callback)

@app.on_event("shutdown")
async def shutdown_event():
    # Cleanup will be handled by dependency injection
    pass 