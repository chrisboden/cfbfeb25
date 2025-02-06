from flask import Flask, request, jsonify, render_template
from termcolor import colored
import json
import os
import uuid
from datetime import datetime
from dateutil import parser
from dotenv import load_dotenv
from ai_parser import parse_task

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Ensure data directory exists
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
TASKS_FILE = os.path.join(DATA_DIR, 'tasks.json')

def init_data():
    """Initialize the tasks storage file if it doesn't exist"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    if not os.path.exists(TASKS_FILE):
        with open(TASKS_FILE, 'w') as f:
            json.dump({"tasks": []}, f)
        print(colored("[INFO] Created new tasks storage file", "green"))

def load_tasks():
    """Load tasks from JSON file"""
    try:
        with open(TASKS_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(colored(f"[ERROR] Failed to load tasks: {str(e)}", "red"))
        return {"tasks": []}

def save_tasks(tasks_data):
    """Save tasks to JSON file"""
    try:
        with open(TASKS_FILE, 'w') as f:
            json.dump(tasks_data, f, indent=2)
        print(colored("[INFO] Tasks saved successfully", "green"))
    except Exception as e:
        print(colored(f"[ERROR] Failed to save tasks: {str(e)}", "red"))

@app.route('/')
def index():
    """Render the main application page"""
    return render_template('index.html')

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    return jsonify(load_tasks())

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task with AI parsing"""
    try:
        data = request.json
        raw_text = data.get('raw_text', '')
        
        # Parse task using AI
        parsed_data = parse_task(raw_text)
        
        if not parsed_data:
            # Fallback to basic task creation if AI parsing fails
            parsed_data = {
                'content': raw_text,
                'due_date': None,
                'category': 'Personal',
                'priority': 1,
                'estimated_duration': None
            }
        
        tasks_data = load_tasks()
        
        new_task = {
            "id": str(uuid.uuid4()),
            "raw_text": raw_text,
            "content": parsed_data['content'],
            "due_date": parsed_data['due_date'],
            "category": parsed_data['category'],
            "priority": parsed_data['priority'],
            "estimated_duration": parsed_data.get('estimated_duration'),
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        
        tasks_data['tasks'].append(new_task)
        save_tasks(tasks_data)
        
        print(colored(f"[INFO] Created new task: {new_task['content']}", "green"))
        return jsonify(new_task), 201
    
    except Exception as e:
        error_msg = f"Failed to create task: {str(e)}"
        print(colored(f"[ERROR] {error_msg}", "red"))
        return jsonify({"error": error_msg}), 400

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    try:
        tasks_data = load_tasks()
        tasks_data['tasks'] = [t for t in tasks_data['tasks'] if t['id'] != task_id]
        save_tasks(tasks_data)
        
        print(colored(f"[INFO] Deleted task: {task_id}", "yellow"))
        return '', 204
    
    except Exception as e:
        error_msg = f"Failed to delete task: {str(e)}"
        print(colored(f"[ERROR] {error_msg}", "red"))
        return jsonify({"error": error_msg}), 400

if __name__ == '__main__':
    init_data()
    app.run(debug=True) 