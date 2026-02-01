from voice_recognition import listen_from_mic
from ai_engine import evaluate_soft_skills
from tts_utils import speak_text

spoken_text = listen_from_mic()

if spoken_text:
    result = evaluate_soft_skills(spoken_text)
    print(result)
    speak_text(result["feedback"])