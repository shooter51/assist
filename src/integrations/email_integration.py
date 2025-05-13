import imaplib
import email
import logging
from typing import List, Dict, Any, Optional
from email.header import decode_header
import asyncio
from datetime import datetime, timedelta
import re

logger = logging.getLogger(__name__)

class EmailIntegration:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.imap_server = config['server']
        self.imap_port = config['port']
        self.username = config['username']
        self.password = config['password']
        self.use_ssl = config.get('use_ssl', True)
        self.mailbox = config.get('mailbox', 'INBOX')
        self.imap = None
        self.monitoring = False
    
    async def connect(self) -> bool:
        """Connect to the email server"""
        try:
            if self.use_ssl:
                self.imap = imaplib.IMAP4_SSL(self.imap_server, self.imap_port)
            else:
                self.imap = imaplib.IMAP4(self.imap_server, self.imap_port)
            
            self.imap.login(self.username, self.password)
            logger.info(f"Successfully connected to {self.imap_server}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to email server: {str(e)}")
            return False
    
    async def disconnect(self) -> None:
        """Disconnect from the email server"""
        if self.imap:
            try:
                self.imap.close()
                self.imap.logout()
                logger.info("Successfully disconnected from email server")
            except Exception as e:
                logger.error(f"Error disconnecting from email server: {str(e)}")
    
    def _decode_email_header(self, header: str) -> str:
        """Decode email header"""
        decoded_header = decode_header(header)
        return ''.join(
            text.decode(charset or 'utf-8') if isinstance(text, bytes) else text
            for text, charset in decoded_header
        )
    
    def _parse_email(self, email_data: bytes) -> Dict[str, Any]:
        """Parse email message"""
        message = email.message_from_bytes(email_data)
        
        # Extract basic information
        subject = self._decode_email_header(message['subject'])
        from_addr = self._decode_email_header(message['from'])
        date = email.utils.parsedate_to_datetime(message['date'])
        
        # Extract body
        body = ""
        if message.is_multipart():
            for part in message.walk():
                if part.get_content_type() == "text/plain":
                    body = part.get_payload(decode=True).decode()
                    break
        else:
            body = message.get_payload(decode=True).decode()
        
        return {
            'subject': subject,
            'from': from_addr,
            'date': date,
            'body': body,
            'message_id': message['message-id']
        }
    
    async def fetch_emails(self, 
                          since: Optional[datetime] = None,
                          limit: int = 100) -> List[Dict[str, Any]]:
        """Fetch emails from the server"""
        try:
            self.imap.select(self.mailbox)
            
            # Build search criteria
            search_criteria = []
            if since:
                date_str = since.strftime("%d-%b-%Y")
                search_criteria.append(f'(SINCE {date_str})')
            
            # Search for emails
            status, messages = self.imap.search(None, ' '.join(search_criteria))
            if status != 'OK':
                raise Exception("Failed to search emails")
            
            # Get message numbers
            message_nums = messages[0].split()
            message_nums = message_nums[-limit:]  # Get most recent emails
            
            emails = []
            for num in message_nums:
                status, data = self.imap.fetch(num, '(RFC822)')
                if status == 'OK':
                    email_data = data[0][1]
                    parsed_email = self._parse_email(email_data)
                    emails.append(parsed_email)
            
            return emails
        except Exception as e:
            logger.error(f"Error fetching emails: {str(e)}")
            raise
    
    async def mark_as_read(self, message_id: str) -> bool:
        """Mark an email as read"""
        try:
            self.imap.select(self.mailbox)
            status, messages = self.imap.search(None, f'(HEADER Message-ID "{message_id}")')
            if status != 'OK':
                return False
            
            for num in messages[0].split():
                self.imap.store(num, '+FLAGS', '\\Seen')
            return True
        except Exception as e:
            logger.error(f"Error marking email as read: {str(e)}")
            return False
    
    async def start_monitoring(self, callback, interval: int = 300) -> None:
        """Start monitoring for new emails"""
        self.monitoring = True
        
        async def monitor_loop():
            last_check = datetime.now()
            
            while self.monitoring:
                try:
                    # Fetch new emails
                    new_emails = await self.fetch_emails(since=last_check)
                    
                    # Process new emails
                    for email_data in new_emails:
                        await callback(email_data)
                    
                    last_check = datetime.now()
                    await asyncio.sleep(interval)
                except Exception as e:
                    logger.error(f"Error in email monitoring: {str(e)}")
                    await asyncio.sleep(60)  # Wait before retrying
        
        asyncio.create_task(monitor_loop())
    
    async def stop_monitoring(self) -> None:
        """Stop monitoring for new emails"""
        self.monitoring = False 