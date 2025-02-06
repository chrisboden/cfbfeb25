# AI-Powered Todo List Application PRD (Updated)
**Created by**: Chris Boden, Peregian Digital Hub  
**Objective**: Demonstrate practical AI integration in a simple web app that combines natural language processing with classic CRUD operations

## 1. Key Features

### 1.1 Core Functionality
- Natural language task input ("Buy milk tomorrow at 9am")
- Basic CRUD operations (Create, Read, Update, Delete)
- Hybrid date parsing (Python) + task understanding (LLM)
- Responsive web interface with real-time feedback

### 1.2 AI Enhancements
- **Smart Task Parsing**:
  - Reliable date/time extraction using Python's dateutil
  - Auto-categorize tasks (Personal, Work, Shopping, Health, Other)
  - Intelligent priority assignment (1-3)
  - Duration estimation
- **Task Intelligence**:
  - Confidence scores for AI interpretations
  - Alternative parsing suggestions
  - Learning from user corrections
- **Analytics**:
  - Task completion patterns
  - Category distribution
  - Priority breakdown
  - Time estimation accuracy

## 2. Technical Specifications

### 2.1 Architecture

```
Frontend (HTML/JS)              Backend (Python/Flask)
│                              │
├─▶ POST /api/tasks ───────────┼─▶ Date Parser (dateutil)
│   (Natural language text)    │
│                             ├─▶ LLM (OpenRouter/Mistral)
│                             │   - Categories
│                             │   - Priorities
│                             │   - Duration
│                             │
◀─── Structured JSON ──────────┤
│                             │
├─▶ GET /tasks ───────────────┼─▶ Task Storage
│                             │   (JSON/SQLite)
◀─── Task List ───────────────┤
```

### 2.2 Data Model
```json
{
  "tasks": [{
    "id": "uuid4",
    "raw_text": "Buy milk tomorrow at 9am",
    "content": "Buy milk",
    "due_date": "2024-02-07T09:00:00",
    "category": "Shopping",
    "priority": 2,
    "estimated_duration": 15,
    "status": "pending",
    "created_at": "2024-02-06T14:30:00",
    "ai_metadata": {
      "confidence": {
        "category": 0.92,
        "priority": 0.85,
        "duration": 0.78
      },
      "alternatives": [{
        "category": "Personal",
        "confidence": 0.45
      }]
    }
  }]
}
```

## 3. Implementation Details

### 3.1 Date Parsing
- Use Python's dateutil for reliable date extraction
- Handle relative dates (tomorrow, next week, etc.)
- Support special dates (Valentine's Day, holidays)
- Auto-correct past dates to future occurrences
- Extract and validate time components

### 3.2 LLM Integration
- Use OpenRouter API with Mistral-7B model
- Low temperature (0.1) for consistent output
- Structured JSON response format
- Separate prompts for different aspects
- Robust error handling and fallbacks

### 3.3 Storage System
Phase 1 (Current):
- JSON file storage
- Basic CRUD operations
- Error handling and logging

Phase 2 (Planned):
- SQLite database
- Atomic operations
- Concurrent access handling
- Automated backups

## 4. User Interface

### 4.1 Task Input
- Natural language input field
- Real-time AI processing indicator
- Parsed result preview
- Confidence indicators
- Manual override options

### 4.2 Task Display
- Priority-based color coding
- Clear due date formatting
- Category and duration display
- Quick actions (complete, delete)
- Sorting and filtering options

### 4.3 Error Handling
- Graceful AI failure fallback
- User-friendly error messages
- Retry mechanisms
- Manual input fallback

## 5. Security & Performance

### 5.1 Security
- Input sanitization
- API key protection
- Rate limiting
- CORS configuration
- PII detection and handling

### 5.2 Performance
- Client-side caching
- API response time monitoring
- LLM call optimization
- Batch processing where applicable

## 6. Demo Requirements
- Example task suggestions
- Visual logging in terminal
- AI confidence visualization
- Performance metrics display
- Error state demonstrations

## 7. Future Enhancements
- Task completion tracking
- Pattern-based suggestions
- Calendar integration
- Mobile app version
- Multi-user support
- Data export/import

## 8. Success Metrics
- Parse success rate > 95%
- Response time < 500ms
- User correction rate < 10%
- Task completion tracking
- User satisfaction score

## 9. Known Limitations
- JSON storage scalability
- No concurrent write handling
- Limited error recovery
- Basic AI confidence scoring
- No user correction learning

## 10. Development Roadmap

### Phase 1 (Completed)
- Basic task parsing
- JSON storage
- Web interface
- Date parsing
- Priority visualization

### Phase 2 (In Progress)
- SQLite integration
- Confidence scoring
- User corrections
- Performance monitoring
- Error handling improvements

### Phase 3 (Planned)
- Analytics dashboard
- Pattern learning
- Mobile responsiveness
- Multi-user support
- API documentation

## 11. Non-Functional Requirements
- Performance: <500ms response time for AI parsing
- Security: Read-only demo mode available
- Accessibility: WCAG 2.1 AA compliant
- Reliability: 99.9% uptime during demo period

## 12. Risk Mitigation
- Fallback to manual entry if AI fails
- Local LLM backup if cloud API unavailable
- Auto-recovery from JSON corruption
- Snapshot system for demo rollbacks

## 13. Deployment
- Single-command setup:
  ```bash
  ./setup_demo.sh --enable-ai --log-level verbose
  ```
- Configurable options:
  - AI provider
  - JSON storage location
  - Rate limits
  - Demo duration timer

## 14. Success Metrics
- Demo completion rate: 100%
- Average tasks created per demo: 5+
- Participant understanding score: 4/5
- Follow-up interest rate: >30%

## Glossary
- **LLM**: Large Language Model (e.g., GPT-3.5/4, Llama 2)
- **CRUD**: Create, Read, Update, Delete operations
- **PII**: Personally Identifiable Information
- **WCAG**: Web Content Accessibility Guidelines

