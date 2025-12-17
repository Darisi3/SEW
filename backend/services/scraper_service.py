import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re

class ScraperService:
    @staticmethod
    def scrape_newspaper_articles(url, max_articles=10):
        """
        Scrape articles from newspaper website
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Common newspaper article selectors
            article_selectors = [
                'article', '.article', '.news-item', '.post', 
                'h1', 'h2', 'h3', '.title', '.headline'
            ]
            
            articles = []
            
            # Try different strategies to find articles
            for selector in article_selectors:
                elements = soup.select(selector)
                for elem in elements[:max_articles]:
                    # Get text content
                    text = elem.get_text(strip=True)
                    if len(text) > 50:  # Minimum length
                        articles.append({
                            'title': elem.get_text(strip=True)[:100],
                            'url': urljoin(url, elem.get('href', '')),
                            'preview': text[:200] + '...'
                        })
            
            return {
                'success': True,
                'articles': articles[:max_articles],
                'count': len(articles)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }