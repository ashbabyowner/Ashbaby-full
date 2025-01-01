from typing import Dict, List, Optional, Any
import asyncio
from fastapi import HTTPException
from ask_sdk_core.skill_builder import SkillBuilder
from ask_sdk_core.dispatch_components import AbstractRequestHandler
from ask_sdk_core.handler_input import HandlerInput
from ask_sdk_model import Response
from google.assistant.embedded.v1alpha2 import embedded_assistant_pb2
from google.assistant.embedded.v1alpha2 import embedded_assistant_pb2_grpc
import grpc
import speech_recognition as sr
from gtts import gTTS
import pyttsx3
import json
import os

class VoiceAssistantService:
    def __init__(self):
        self.alexa_skill_builder = SkillBuilder()
        self.speech_engine = pyttsx3.init()
        self.recognizer = sr.Recognizer()
        self.setup_voice_properties()
        self.setup_intent_handlers()

    def setup_voice_properties(self):
        """Configure voice properties for accessibility."""
        # Set speaking rate (default is 200)
        self.speech_engine.setProperty('rate', 150)
        
        # Set volume (max is 1.0)
        self.speech_engine.setProperty('volume', 0.9)
        
        # Get available voices
        voices = self.speech_engine.getProperty('voices')
        
        # Set a clear, natural voice
        for voice in voices:
            if "english" in voice.name.lower():
                self.speech_engine.setProperty('voice', voice.id)
                break

    def setup_intent_handlers(self):
        """Set up handlers for different voice assistant intents."""
        # Alexa intent handlers
        self.alexa_skill_builder.add_request_handler(LaunchRequestHandler())
        self.alexa_skill_builder.add_request_handler(HelpIntentHandler())
        self.alexa_skill_builder.add_request_handler(HealthCheckIntentHandler())
        self.alexa_skill_builder.add_request_handler(FinanceCheckIntentHandler())
        self.alexa_skill_builder.add_request_handler(TaskReminderIntentHandler())
        self.alexa_skill_builder.add_request_handler(EmergencyAssistanceHandler())
        self.alexa_skill_builder.add_request_handler(DailyRoutineHandler())
        self.alexa_skill_builder.add_request_handler(MedicationReminderHandler())
        
        # Error handlers
        self.alexa_skill_builder.add_exception_handler(
            GlobalExceptionHandler()
        )

    async def process_alexa_request(
        self,
        request_envelope: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process Alexa skill requests."""
        try:
            # Build Alexa skill
            skill = self.alexa_skill_builder.create()
            
            # Process request
            response = await skill.process(request_envelope)
            
            return response

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing Alexa request: {str(e)}"
            )

    async def process_google_assistant_request(
        self,
        request: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process Google Assistant requests."""
        try:
            # Create assistant request
            assist_request = embedded_assistant_pb2.AssistRequest()
            assist_request.audio_in = request.get('audio_data', b'')
            
            # Process request
            response = await self._process_google_request(assist_request)
            
            return response

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing Google Assistant request: {str(e)}"
            )

    async def process_voice_command(
        self,
        audio_data: bytes,
        source: str = 'microphone'
    ) -> Dict[str, Any]:
        """Process voice commands from any source."""
        try:
            # Convert audio to text
            text = await self._speech_to_text(audio_data)
            
            # Process command
            response = await self._process_command(text)
            
            # Convert response to speech
            audio_response = await self._text_to_speech(response['message'])
            
            return {
                'text_response': response['message'],
                'audio_response': audio_response,
                'actions': response.get('actions', [])
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing voice command: {str(e)}"
            )

    async def get_daily_briefing(
        self,
        user_id: str,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate daily briefing for voice assistants."""
        try:
            briefing = {
                'health_updates': await self._get_health_summary(user_id),
                'medication_reminders': await self._get_medication_reminders(user_id),
                'appointments': await self._get_appointments(user_id),
                'tasks': await self._get_priority_tasks(user_id),
                'weather': await self._get_weather_info(preferences.get('location')),
                'emergency_contacts': await self._get_emergency_contacts(user_id)
            }
            
            # Format briefing for speech
            speech_text = self._format_briefing_for_speech(briefing)
            
            # Convert to audio
            audio_briefing = await self._text_to_speech(speech_text)
            
            return {
                'text': speech_text,
                'audio': audio_briefing,
                'data': briefing
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating daily briefing: {str(e)}"
            )

    async def handle_emergency_request(
        self,
        user_id: str,
        request_type: str,
        audio_data: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """Handle emergency assistance requests."""
        try:
            # Process emergency request
            emergency_response = await self._process_emergency(
                user_id, request_type, audio_data
            )
            
            # Generate voice response
            response_audio = await self._text_to_speech(
                emergency_response['message']
            )
            
            return {
                'message': emergency_response['message'],
                'audio_response': response_audio,
                'actions_taken': emergency_response['actions'],
                'emergency_contacts': emergency_response['contacts'],
                'status': emergency_response['status']
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error handling emergency request: {str(e)}"
            )

    async def _speech_to_text(self, audio_data: bytes) -> str:
        """Convert speech to text with error handling."""
        try:
            # Convert audio data to audio file
            audio_file = sr.AudioFile(audio_data)
            
            with audio_file as source:
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source)
                
                # Record audio
                audio = self.recognizer.record(source)
                
                # Convert to text
                text = self.recognizer.recognize_google(
                    audio,
                    language='en-US'
                )
                
                return text

        except sr.UnknownValueError:
            raise ValueError("Could not understand audio")
        except sr.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error with speech recognition service: {str(e)}"
            )

    async def _text_to_speech(
        self,
        text: str,
        language: str = 'en',
        slow: bool = False
    ) -> bytes:
        """Convert text to speech with accessibility options."""
        try:
            # Create gTTS object
            tts = gTTS(text=text, lang=language, slow=slow)
            
            # Save to temporary file
            temp_file = "temp_speech.mp3"
            tts.save(temp_file)
            
            # Read audio data
            with open(temp_file, 'rb') as f:
                audio_data = f.read()
            
            # Clean up
            os.remove(temp_file)
            
            return audio_data

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error converting text to speech: {str(e)}"
            )

    async def _process_command(
        self,
        command: str
    ) -> Dict[str, Any]:
        """Process voice commands with context awareness."""
        try:
            # TODO: Implement command processing logic
            pass

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing command: {str(e)}"
            )

    async def _process_google_request(
        self,
        request: embedded_assistant_pb2.AssistRequest
    ) -> Dict[str, Any]:
        """Process Google Assistant requests."""
        try:
            # TODO: Implement Google Assistant integration
            pass

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing Google Assistant request: {str(e)}"
            )

    def _format_briefing_for_speech(
        self,
        briefing: Dict[str, Any]
    ) -> str:
        """Format briefing data for natural speech."""
        speech_parts = []
        
        # Health updates
        if briefing['health_updates']:
            speech_parts.append(
                "Here are your health updates: " +
                ", ".join(briefing['health_updates'])
            )
        
        # Medication reminders
        if briefing['medication_reminders']:
            speech_parts.append(
                "Your medication reminders: " +
                ", ".join(briefing['medication_reminders'])
            )
        
        # Appointments
        if briefing['appointments']:
            speech_parts.append(
                "Your appointments today: " +
                ", ".join(briefing['appointments'])
            )
        
        # Tasks
        if briefing['tasks']:
            speech_parts.append(
                "Your priority tasks: " +
                ", ".join(briefing['tasks'])
            )
        
        # Weather
        if briefing['weather']:
            speech_parts.append(
                f"The weather today: {briefing['weather']}"
            )
        
        return " ... ".join(speech_parts)

class LaunchRequestHandler(AbstractRequestHandler):
    """Handler for Alexa skill launch."""
    def can_handle(self, handler_input):
        return handler_input.request_envelope.request.type == "LaunchRequest"

    def handle(self, handler_input):
        speech_text = (
            "Welcome to your AI Support Assistant. "
            "I can help you with health monitoring, "
            "medication reminders, emergency assistance, "
            "and daily tasks. What would you like help with?"
        )
        
        return handler_input.response_builder.speak(
            speech_text
        ).ask(speech_text).response

class HelpIntentHandler(AbstractRequestHandler):
    """Handler for help requests."""
    def can_handle(self, handler_input):
        return handler_input.request_envelope.request.type == "IntentRequest" and \
               handler_input.request_envelope.request.intent.name == "AMAZON.HelpIntent"

    def handle(self, handler_input):
        speech_text = (
            "I can help you with: "
            "1. Health monitoring and medication reminders, "
            "2. Emergency assistance, "
            "3. Daily tasks and appointments, "
            "4. Weather updates, "
            "5. Contacting caregivers or emergency services. "
            "What would you like help with?"
        )
        
        return handler_input.response_builder.speak(
            speech_text
        ).ask(speech_text).response

class EmergencyAssistanceHandler(AbstractRequestHandler):
    """Handler for emergency assistance requests."""
    def can_handle(self, handler_input):
        return handler_input.request_envelope.request.type == "IntentRequest" and \
               handler_input.request_envelope.request.intent.name == "EmergencyAssistanceIntent"

    def handle(self, handler_input):
        speech_text = (
            "I'm contacting emergency services and your emergency contacts now. "
            "Stay calm and don't move if you're injured. "
            "Help is on the way. "
            "Would you like me to stay on the line with you?"
        )
        
        return handler_input.response_builder.speak(
            speech_text
        ).ask(speech_text).response

class GlobalExceptionHandler(AbstractRequestHandler):
    """Handler for all unhandled exceptions."""
    def can_handle(self, handler_input):
        return True

    def handle(self, handler_input):
        speech_text = (
            "I'm sorry, I encountered an error. "
            "Please try again or ask for help."
        )
        
        return handler_input.response_builder.speak(
            speech_text
        ).ask(speech_text).response
