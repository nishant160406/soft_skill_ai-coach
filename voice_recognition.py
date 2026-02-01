
import speech_recognition as sr
def listen_from_mic(timeout=5, phrase_time_limit=10, language="en-IN"):
    """
    Capture voice input from the system microphone and convert it to text
    using Google Speech Recognition.

    Requirements:
    - SpeechRecognition
    - PyAudio (with PortAudio installed on macOS)
    - Internet connection (for Google STT)

    Args:
        timeout (int): Seconds to wait for speech to start
        phrase_time_limit (int): Max seconds to record after speech starts
        language (str): Language code (e.g., 'en-IN', 'en-US')

    Returns:
        str: Recognized text (empty string if recognition fails)
    """

    recognizer = sr.Recognizer()

    try:
        with sr.Microphone() as source:
            print("🎤 Listening... please speak")
            recognizer.adjust_for_ambient_noise(source, duration=0.5)

            audio = recognizer.listen(
                source,
                timeout=timeout,
                phrase_time_limit=phrase_time_limit
            )

        text = recognizer.recognize_google(audio, language=language)
        print("📝 You said:", text)
        return text

    except sr.WaitTimeoutError:
        print("⏱️ No speech detected within the timeout period.")
        return ""

    except sr.UnknownValueError:
        print("❌ Sorry, I could not understand the audio.")
        return ""

    except sr.RequestError as e:
        print(f"❌ Speech recognition service error: {e}")
        return ""

    except OSError as e:
        print(f"❌ Microphone / PyAudio error: {e}")
        return ""


# -----------------------------
# Standalone test
# -----------------------------
if __name__ == "__main__":
    print("Voice recognition test started.")
    result = listen_from_mic()
    print("Final recognized text:", result)