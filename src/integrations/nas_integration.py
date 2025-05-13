import os
import logging
from typing import List, Dict, Any, Optional
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import smbclient
from pathlib import Path
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)

class NASEventHandler(FileSystemEventHandler):
    def __init__(self, callback):
        self.callback = callback
    
    def on_created(self, event):
        if not event.is_directory:
            asyncio.create_task(self.callback("created", event.src_path))
    
    def on_modified(self, event):
        if not event.is_directory:
            asyncio.create_task(self.callback("modified", event.src_path))
    
    def on_deleted(self, event):
        if not event.is_directory:
            asyncio.create_task(self.callback("deleted", event.src_path))

class NASIntegration:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.observer = None
        self.mount_point = config['mount_point']
        self._setup_smb_client()
    
    def _setup_smb_client(self):
        """Configure SMB client with credentials"""
        try:
            smbclient.ClientConfig(
                username=self.config.get('username'),
                password=self.config.get('password'),
                domain=self.config.get('domain', '')
            )
        except Exception as e:
            logger.error(f"Failed to setup SMB client: {str(e)}")
            raise
    
    async def mount_share(self) -> bool:
        """Mount the NAS share"""
        try:
            if not os.path.exists(self.mount_point):
                os.makedirs(self.mount_point)
            
            # Mount the share using smbclient
            share_path = f"//{self.config['host']}/{self.config['share']}"
            smbclient.mount(share_path, self.mount_point)
            logger.info(f"Successfully mounted {share_path} to {self.mount_point}")
            return True
        except Exception as e:
            logger.error(f"Failed to mount share: {str(e)}")
            return False
    
    async def unmount_share(self) -> bool:
        """Unmount the NAS share"""
        try:
            smbclient.unmount(self.mount_point)
            logger.info(f"Successfully unmounted {self.mount_point}")
            return True
        except Exception as e:
            logger.error(f"Failed to unmount share: {str(e)}")
            return False
    
    async def list_files(self, path: str = "") -> List[Dict[str, Any]]:
        """List files in the specified path"""
        try:
            full_path = os.path.join(self.mount_point, path)
            files = []
            
            for entry in smbclient.scandir(full_path):
                stat = entry.stat()
                files.append({
                    'name': entry.name,
                    'path': os.path.join(path, entry.name),
                    'size': stat.st_size,
                    'modified': datetime.fromtimestamp(stat.st_mtime),
                    'is_dir': entry.is_dir()
                })
            
            return files
        except Exception as e:
            logger.error(f"Error listing files: {str(e)}")
            raise
    
    async def read_file(self, path: str) -> bytes:
        """Read file contents"""
        try:
            full_path = os.path.join(self.mount_point, path)
            with smbclient.open_file(full_path, mode='rb') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading file: {str(e)}")
            raise
    
    async def write_file(self, path: str, content: bytes) -> bool:
        """Write content to file"""
        try:
            full_path = os.path.join(self.mount_point, path)
            with smbclient.open_file(full_path, mode='wb') as f:
                f.write(content)
            return True
        except Exception as e:
            logger.error(f"Error writing file: {str(e)}")
            return False
    
    async def delete_file(self, path: str) -> bool:
        """Delete a file"""
        try:
            full_path = os.path.join(self.mount_point, path)
            smbclient.remove(full_path)
            return True
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            return False
    
    async def start_monitoring(self, callback) -> None:
        """Start monitoring the NAS share for changes"""
        try:
            event_handler = NASEventHandler(callback)
            self.observer = Observer()
            self.observer.schedule(event_handler, self.mount_point, recursive=True)
            self.observer.start()
            logger.info(f"Started monitoring {self.mount_point}")
        except Exception as e:
            logger.error(f"Error starting file monitoring: {str(e)}")
            raise
    
    async def stop_monitoring(self) -> None:
        """Stop monitoring the NAS share"""
        if self.observer:
            self.observer.stop()
            self.observer.join()
            logger.info("Stopped file monitoring") 