"""
Flask API for AI Soft Skill Coach
Provides endpoints for AI evaluation and TTS audio generation
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os

from tts_utils import speak_text

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Directory to store generated audio files
AUDIO_DIR = os.path.dirname(os.path.abspath(__file__))

# Try to import AI engine, but don't fail if model can't load
try:
    from ai_engine import evaluate_soft_skills
    AI_AVAILABLE = True
except Exception as e:
    print(f"Warning: AI engine not available: {e}")
    AI_AVAILABLE = False
    evaluate_soft_skills = None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok", 
        "message": "AI Soft Skill Coach API is running",
        "ai_available": AI_AVAILABLE
    })

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    """
    Evaluate a user's answer to a soft skill question
    """
    try:
        data = request.get_json()
        
        if not data or 'answer' not in data:
            return jsonify({"error": "Missing 'answer' in request body"}), 400
        
        answer = data['answer']
        
        if AI_AVAILABLE and evaluate_soft_skills:
            # Call the AI engine to evaluate
            result = evaluate_soft_skills(answer)
            return jsonify(result)
        else:
            # Return mock result if AI not available
            return jsonify({
                "clarity": 7,
                "confidence": 6,
                "tone": 7,
                "feedback": "AI model is not loaded. This is mock feedback.",
                "improvedAnswer": answer
            })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    """
    Generate audio from text feedback
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' in request body"}), 400
        
        text = data['text']
        
        # Generate unique filename based on hash of text
        import hashlib
        text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
        filename = f"feedback_{text_hash}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)
        
        # Check if already generated
        if not os.path.exists(filepath):
            speak_text(text, filepath)
        
        return send_file(filepath, mimetype='audio/mpeg')
    
    except Exception as e:
        print(f"TTS Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/audio/<filename>', methods=['GET'])
def get_audio(filename):
    """Serve a generated audio file"""
    try:
        filepath = os.path.join(AUDIO_DIR, filename)
        if os.path.exists(filepath):
            return send_file(filepath, mimetype='audio/mpeg')
        else:
            return jsonify({"error": "Audio file not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("AI Soft Skill Coach API")
    print("="*50)
    print(f"AI Model: {'Available' if AI_AVAILABLE else 'Not loaded (using mock data)'}")
    print("\nEndpoints:")
    print("  GET  /api/health   - Health check")
    print("  POST /api/evaluate - Evaluate answer")
    print("  POST /api/tts      - Generate audio from text")
    print("\nStarting server on http://localhost:5000")
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
