import logging
from typing import List, Dict, Any, Optional
import tweepy
import facebook
import asyncio
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SocialMediaIntegration:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.twitter_client = None
        self.facebook_client = None
        self.monitoring = False
        self._initialize_clients()
    
    def _initialize_clients(self) -> None:
        """Initialize social media API clients"""
        try:
            # Initialize Twitter client
            if 'twitter' in self.config:
                twitter_config = self.config['twitter']
                auth = tweepy.OAuthHandler(
                    twitter_config['api_key'],
                    twitter_config['api_secret']
                )
                auth.set_access_token(
                    twitter_config['access_token'],
                    twitter_config['access_token_secret']
                )
                self.twitter_client = tweepy.API(auth)
            
            # Initialize Facebook client
            if 'facebook' in self.config:
                facebook_config = self.config['facebook']
                self.facebook_client = facebook.GraphAPI(
                    access_token=facebook_config['access_token'],
                    version="3.1"
                )
        except Exception as e:
            logger.error(f"Failed to initialize social media clients: {str(e)}")
            raise
    
    async def get_twitter_timeline(self, 
                                 count: int = 20,
                                 since_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get tweets from user's timeline"""
        try:
            if not self.twitter_client:
                raise Exception("Twitter client not initialized")
            
            tweets = self.twitter_client.home_timeline(
                count=count,
                since_id=since_id,
                tweet_mode='extended'
            )
            
            return [{
                'id': tweet.id_str,
                'text': tweet.full_text,
                'created_at': tweet.created_at,
                'user': tweet.user.screen_name,
                'retweet_count': tweet.retweet_count,
                'favorite_count': tweet.favorite_count
            } for tweet in tweets]
        except Exception as e:
            logger.error(f"Error fetching Twitter timeline: {str(e)}")
            raise
    
    async def post_tweet(self, text: str) -> Dict[str, Any]:
        """Post a new tweet"""
        try:
            if not self.twitter_client:
                raise Exception("Twitter client not initialized")
            
            tweet = self.twitter_client.update_status(text)
            return {
                'id': tweet.id_str,
                'text': tweet.text,
                'created_at': tweet.created_at
            }
        except Exception as e:
            logger.error(f"Error posting tweet: {str(e)}")
            raise
    
    async def get_facebook_feed(self,
                              limit: int = 20,
                              since: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Get posts from Facebook feed"""
        try:
            if not self.facebook_client:
                raise Exception("Facebook client not initialized")
            
            # Build query parameters
            params = {'limit': limit}
            if since:
                params['since'] = since.timestamp()
            
            # Get feed
            feed = self.facebook_client.get_connections('me', 'feed', **params)
            
            return [{
                'id': post['id'],
                'message': post.get('message', ''),
                'created_time': datetime.strptime(
                    post['created_time'],
                    '%Y-%m-%dT%H:%M:%S%z'
                ),
                'likes': post.get('likes', {}).get('summary', {}).get('total_count', 0)
            } for post in feed['data']]
        except Exception as e:
            logger.error(f"Error fetching Facebook feed: {str(e)}")
            raise
    
    async def post_facebook_status(self, message: str) -> Dict[str, Any]:
        """Post a new status to Facebook"""
        try:
            if not self.facebook_client:
                raise Exception("Facebook client not initialized")
            
            post = self.facebook_client.put_object(
                parent_object='me',
                connection_name='feed',
                message=message
            )
            
            return {
                'id': post['id'],
                'message': message
            }
        except Exception as e:
            logger.error(f"Error posting Facebook status: {str(e)}")
            raise
    
    async def start_monitoring(self, callback, interval: int = 300) -> None:
        """Start monitoring social media feeds"""
        self.monitoring = True
        
        async def monitor_loop():
            last_twitter_id = None
            last_facebook_time = None
            
            while self.monitoring:
                try:
                    # Monitor Twitter
                    if self.twitter_client:
                        tweets = await self.get_twitter_timeline(since_id=last_twitter_id)
                        if tweets:
                            last_twitter_id = tweets[0]['id']
                            for tweet in tweets:
                                await callback('twitter', tweet)
                    
                    # Monitor Facebook
                    if self.facebook_client:
                        posts = await self.get_facebook_feed(since=last_facebook_time)
                        if posts:
                            last_facebook_time = posts[0]['created_time']
                            for post in posts:
                                await callback('facebook', post)
                    
                    await asyncio.sleep(interval)
                except Exception as e:
                    logger.error(f"Error in social media monitoring: {str(e)}")
                    await asyncio.sleep(60)  # Wait before retrying
        
        asyncio.create_task(monitor_loop())
    
    async def stop_monitoring(self) -> None:
        """Stop monitoring social media feeds"""
        self.monitoring = False 