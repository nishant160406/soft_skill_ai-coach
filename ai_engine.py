import re
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

# Use float16 for faster inference (if GPU available, otherwise float32)
dtype = torch.float16 if torch.cuda.is_available() else torch.float32

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=dtype,
    device_map="auto",
    low_cpu_mem_usage=True
)

# Set model to eval mode for faster inference
model.eval()


def extract_score(text: str, label: str) -> int:
    """
    Extracts the LAST numeric score (0-10) from model output.
    """
    pattern = rf"{label}.*?:\s*(\d+)"
    matches = re.findall(pattern, text, re.IGNORECASE)
    if matches:
        score = int(matches[-1])
        return min(max(score, 0), 10)
    return 5


def extract_section(text: str, section_name: str) -> str:
    """
    Extracts the content after a section label.
    """
    patterns = [
        rf"{section_name}:\s*\n?(.*?)(?=\n\n[A-Z]|\n[A-Z][a-z]+\s*(score|:)|\Z)",
        rf"{section_name}:\s*(.+?)(?=\n[A-Z]|\Z)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            result = match.group(1).strip()
            if result and len(result) > 10:
                return result
    return ""


def evaluate_soft_skills(answer: str, question: str = "") -> dict:
    """
    Evaluate the user's answer using the AI model.
    Returns scores for clarity, confidence, tone, feedback, and improved answer.
    """
    import random
    
    question_text = f"Q: {question}\n" if question else ""
    
    # Shorter prompt for faster generation
    perspectives = [
        "concise and impactful",
        "specific achievements",
        "leadership qualities",
        "problem-solving approach",
        "teamwork aspects",
        "confident language",
    ]
    focus = random.choice(perspectives)
    
    prompt = f"""Evaluate this answer for soft skills. Be brief.

{question_text}Answer: {answer}

Clarity score (0-10): 
Confidence score (0-10): 
Tone score (0-10): 

Feedback: [1-2 sentences on improvements, focus on {focus}]

Improved answer: [Better version with {focus}]"""

    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
    inputs = {k: v.to(model.device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=250,
            temperature=0.7,
            do_sample=True,
            top_p=0.9,
            repetition_penalty=1.2,
            pad_token_id=tokenizer.eos_token_id
        )

    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract the response after the prompt
    response_text = generated_text[len(prompt):] if len(generated_text) > len(prompt) else generated_text
    
    # Extract scores
    clarity = extract_score(response_text, "clarity")
    confidence = extract_score(response_text, "confidence")
    tone = extract_score(response_text, "professional tone|tone")
    
    # Extract feedback and improved answer
    feedback = extract_section(response_text, "feedback")
    improved = extract_section(response_text, "improved answer")
    
    # Fallback if extraction failed
    if not feedback or len(feedback) < 20:
        feedback = f"Your response about '{answer[:50]}...' shows effort. Consider using more specific examples and confident language to strengthen your points."
    
    if not improved or len(improved) < 20:
        improved = f"I handle {answer.split()[0:5] if answer else 'challenges'} effectively by focusing on clear communication, maintaining a positive attitude, and applying proven strategies to achieve results."
    
    return {
        "clarity": clarity,
        "confidence": confidence,
        "tone": tone,
        "feedback": feedback,
        "improvedAnswer": improved
    }