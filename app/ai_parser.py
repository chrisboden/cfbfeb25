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
        
        current_time = datetime.now()
        
        # Prompt for the LLM
        prompt = f"""Current timestamp: {current_time.isoformat()}

Analyze this task and extract structured information:
Task: "{raw_text}"

Rules:
1. Remove any date/time information from the content
2. Extract date and time if specified:
   - Use ISO format (YYYY-MM-DDTHH:MM:SS)
   - For relative dates (tomorrow, next week), calculate from current timestamp
   - For recurring dates (Valentine's Day), use next occurrence
   - For times without dates, assume nearest future occurrence
3. Categorize based on task nature:
   - Business: work, meetings, calls, deadlines, projects
   - Shopping: buying, purchasing, groceries, items
   - Health: exercise, medical, wellness, fitness
   - Personal: everything else
4. Set priority (1-3):
   - 3: Urgent/Important
   - 2: Important but not urgent
   - 1: Regular task
5. Estimate duration in minutes

Output in exactly this format (replace text in <>):
{{
    "content": "<task without date/time>",
    "due_date": "<ISO datetime or null>",
    "category": "<Business|Shopping|Health|Personal>",
    "priority": <1|2|3>,
    "estimated_duration": <minutes>,
    "analysis": {{
        "date_factors": ["<reason for date/time selection>"],
        "urgency_factors": ["<reason for priority>"],
        "category_factors": ["<reason for category>"]
    }}
}}"""

        # Call OpenRouter API
        headers = {
            'Authorization': f'Bearer {OPENROUTER_API_KEY}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000'
        }
        
        data = {
            'model': 'openai/gpt-4o-mini',
            'messages': [
                {
                    'role': 'system', 
                    'content': f'You are a task parsing assistant that extracts structured data from natural language task descriptions. Always return valid JSON matching the exact schema requested. Current time is {current_time.isoformat()}.'
                },
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.1,
            'response_format': { 'type': 'json_object' }
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
        
        # If LLM provided a date, use it; otherwise try our date parser
        if not parsed_data.get('due_date'):
            extracted_date = parse_date(raw_text)
            if extracted_date:
                parsed_data['due_date'] = extracted_date.isoformat()
        
        print(colored(f"[AI] Parsed result: {json.dumps(parsed_data, indent=2)}", "green"))
        return parsed_data
        
    except Exception as e:
        print(colored(f"[ERROR] Task parsing failed: {str(e)}", "red"))
        return None 