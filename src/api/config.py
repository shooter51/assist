import os
from typing import Dict, Any
import yaml
from dotenv import load_dotenv

def load_config() -> Dict[str, Any]:
    """Load configuration from environment variables and config file"""
    # Load environment variables
    load_dotenv()
    
    # Load YAML config
    config_path = os.getenv('CONFIG_PATH', 'config/config.yaml')
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Override with environment variables
    config['llm']['model'] = os.getenv('LLM_MODEL', config['llm']['model'])
    config['llm']['temperature'] = float(os.getenv('LLM_TEMPERATURE', config['llm']['temperature']))
    
    # NAS configuration
    config['integrations']['nas'].update({
        'host': os.getenv('NAS_HOST', config['integrations']['nas']['host']),
        'share': os.getenv('NAS_SHARE', config['integrations']['nas']['share']),
        'mount_point': os.getenv('NAS_MOUNT_POINT', config['integrations']['nas']['mount_point']),
        'username': os.getenv('NAS_USERNAME', config['integrations']['nas'].get('username', '')),
        'password': os.getenv('NAS_PASSWORD', config['integrations']['nas'].get('password', ''))
    })
    
    # Email configuration
    config['integrations']['email'].update({
        'server': os.getenv('EMAIL_SERVER', config['integrations']['email']['server']),
        'port': int(os.getenv('EMAIL_PORT', config['integrations']['email']['port'])),
        'username': os.getenv('EMAIL_USERNAME', config['integrations']['email'].get('username', '')),
        'password': os.getenv('EMAIL_PASSWORD', config['integrations']['email'].get('password', '')),
        'use_ssl': os.getenv('EMAIL_USE_SSL', 'true').lower() == 'true'
    })
    
    # Social Media configuration
    if 'twitter' in config['integrations']['social_media']:
        config['integrations']['social_media']['twitter'].update({
            'api_key': os.getenv('TWITTER_API_KEY', ''),
            'api_secret': os.getenv('TWITTER_API_SECRET', ''),
            'access_token': os.getenv('TWITTER_ACCESS_TOKEN', ''),
            'access_token_secret': os.getenv('TWITTER_ACCESS_TOKEN_SECRET', '')
        })
    
    if 'facebook' in config['integrations']['social_media']:
        config['integrations']['social_media']['facebook'].update({
            'access_token': os.getenv('FACEBOOK_ACCESS_TOKEN', '')
        })
    
    # API configuration
    config['api'].update({
        'host': os.getenv('API_HOST', config['api']['host']),
        'port': int(os.getenv('API_PORT', config['api']['port'])),
        'debug': os.getenv('API_DEBUG', 'false').lower() == 'true'
    })
    
    # Security configuration
    config['security'].update({
        'api_key_required': os.getenv('API_KEY_REQUIRED', 'true').lower() == 'true',
        'encryption_key_path': os.getenv('ENCRYPTION_KEY_PATH', config['security']['encryption_key_path']),
        'ssl_enabled': os.getenv('SSL_ENABLED', 'false').lower() == 'true'
    })
    
    return config

def get_nas_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Get NAS configuration"""
    return config['integrations']['nas']

def get_email_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Get email configuration"""
    return config['integrations']['email']

def get_social_media_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Get social media configuration"""
    return config['integrations']['social_media']

def get_api_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Get API configuration"""
    return config['api']

def get_security_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Get security configuration"""
    return config['security'] 