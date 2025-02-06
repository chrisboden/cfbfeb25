import os
import requests
from termcolor import colored
from datetime import datetime, timedelta
from dateutil import parser
from dateutil.relativedelta import relativedelta
import json
import re

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
OPENROUTER_BASE_URL = os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')

def parse_date(text):
    """Parse date from text, handling relative dates correctly"""
    try:
        # Common relative date patterns
        today = datetime.now()
        text = text.lower()
        
        # Handle special keywords
        if 'tomorrow' in text:
            return today + timedelta(days=1)
        elif 'next week' in text:
            return today + timedelta(weeks=1)
        elif 'next month' in text:
            return today + relativedelta(months=1)
        elif 'tonight' in text:
            return today.replace(hour=20, minute=0, second=0, microsecond=0)
        elif 'valentines day' in text or 'valentine\'s day' in text:
            next_valentines = datetime(today.year, 2, 14)
            if next_valentines < today:
                next_valentines = datetime(today.year + 1, 2, 14)
            return next_valentines
        
        # Try to parse explicit date/time
        parsed = parser.parse(text, fuzzy=True, default=today)
        
        # If parsed date is in the past, assume next occurrence
        if parsed < today:
            if parsed.time() != today.time():  # If time was specified
                # Move to tomorrow
                parsed = parsed + timedelta(days=1)
            else:
                # Move to next year
                parsed = parsed.replace(year=today.year + 1)
        
        return parsed
    except:
        return None

def parse_task(raw_text):
    """
    Parse a natural language task description using OpenRouter API
    Returns structured task data including due date, category, and priority
    """
    try:
        print(colored(f"[AI] Parsing task: {raw_text}", "blue"))
        
        # First try to extract date directly
        due_date = parse_date(raw_text)
        
        # Prompt for the LLM
        prompt = f"""Parse the following task and extract structured information:
Task: "{raw_text}"

Return a JSON object with these fields:
- content: The main task description (without date/time information)
- category: One of [Work, Personal, Shopping, Health, Other]
- priority: 1 (low) to 3 (high) based on urgency
- estimated_duration: estimated minutes to complete

Only return the JSON, no other text."""

        # Call OpenRouter API
        headers = {
            'Authorization': f'Bearer {OPENROUTER_API_KEY}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000'
        }
        
        data = {
            'model': 'mistralai/mistral-7b-instruct',
            'messages': [
                {'role': 'system', 'content': 'You are a task parsing assistant. You extract structured data from natural language task descriptions.'},
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.1
        }
        
        response = requests.post(
            f'{OPENROUTER_BASE_URL}/chat/completions',
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            print(colored(f"[ERROR] OpenRouter API error: {response.text}", "red"))
            return None
            
        # Extract the JSON response from the LLM
        result = response.json()
        parsed_text = result['choices'][0]['message']['content']
        parsed_data = json.loads(parsed_text)
        
        # Add the parsed date
        parsed_data['due_date'] = due_date.isoformat() if due_date else None
        
        print(colored(f"[AI] Parsed result: {json.dumps(parsed_data, indent=2)}", "green"))
        return parsed_data
        
    except Exception as e:
        print(colored(f"[ERROR] Task parsing failed: {str(e)}", "red"))
        return None 