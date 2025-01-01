from typing import Dict, List, Optional, Any
from fastapi import HTTPException
import pyttsx3
from gtts import gTTS
import speech_recognition as sr
from PIL import Image
import cv2
import numpy as np
from transformers import pipeline
import json
import os

class AccessibilityService:
    def __init__(self):
        self.speech_engine = pyttsx3.init()
        self.recognizer = sr.Recognizer()
        self.image_captioner = pipeline("image-to-text")
        self.setup_accessibility_features()

    def setup_accessibility_features(self):
        """Configure accessibility features."""
        # Configure speech settings
        self.speech_engine.setProperty('rate', 150)  # Slower speaking rate
        self.speech_engine.setProperty('volume', 0.9)
        
        # Set clear voice
        voices = self.speech_engine.getProperty('voices')
        for voice in voices:
            if "english" in voice.name.lower():
                self.speech_engine.setProperty('voice', voice.id)
                break

    async def process_voice_input(
        self,
        audio_data: bytes,
        user_preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process voice input with accessibility features."""
        try:
            # Convert speech to text
            text = await self._speech_to_text(
                audio_data,
                language=user_preferences.get('language', 'en-US')
            )
            
            # Process command
            response = await self._process_accessible_command(
                text, user_preferences
            )
            
            # Generate speech response
            audio_response = await self._text_to_speech(
                response['message'],
                user_preferences
            )
            
            return {
                'text': text,
                'response': response,
                'audio': audio_response
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error processing voice input: {str(e)}"
            )

    async def enhance_visual_content(
        self,
        image_data: bytes,
        enhancement_type: str
    ) -> bytes:
        """Enhance visual content for better accessibility."""
        try:
            # Convert bytes to image
            image = Image.open(io.BytesIO(image_data))
            
            if enhancement_type == 'contrast':
                enhanced = self._enhance_contrast(image)
            elif enhancement_type == 'magnify':
                enhanced = self._magnify_image(image)
            elif enhancement_type == 'color_blind':
                enhanced = self._adapt_for_color_blindness(image)
            else:
                raise ValueError(f"Unknown enhancement type: {enhancement_type}")
            
            # Convert back to bytes
            output = io.BytesIO()
            enhanced.save(output, format='PNG')
            return output.getvalue()

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error enhancing visual content: {str(e)}"
            )

    async def generate_image_description(
        self,
        image_data: bytes,
        detail_level: str = 'detailed'
    ) -> Dict[str, Any]:
        """Generate accessible descriptions for images."""
        try:
            # Convert bytes to image
            image = Image.open(io.BytesIO(image_data))
            
            # Generate caption
            caption = self.image_captioner(image)[0]['generated_text']
            
            # Generate detailed description if requested
            if detail_level == 'detailed':
                details = await self._analyze_image_details(image)
                description = self._format_image_description(
                    caption, details
                )
            else:
                description = caption
            
            # Convert to speech
            audio_description = await self._text_to_speech(description)
            
            return {
                'caption': caption,
                'description': description,
                'audio_description': audio_description
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating image description: {str(e)}"
            )

    async def provide_navigation_assistance(
        self,
        current_screen: Dict[str, Any],
        user_preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Provide navigation assistance for the interface."""
        try:
            # Analyze screen elements
            elements = await self._analyze_screen_elements(current_screen)
            
            # Generate navigation instructions
            instructions = self._generate_navigation_instructions(
                elements, user_preferences
            )
            
            # Convert to speech
            audio_instructions = await self._text_to_speech(
                instructions['text']
            )
            
            return {
                'instructions': instructions,
                'audio': audio_instructions,
                'shortcuts': instructions['shortcuts'],
                'next_actions': instructions['next_actions']
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error providing navigation assistance: {str(e)}"
            )

    async def simplify_interface(
        self,
        interface_data: Dict[str, Any],
        user_preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Simplify interface based on user needs."""
        try:
            # Analyze current interface
            analysis = await self._analyze_interface_complexity(
                interface_data
            )
            
            # Generate simplified version
            simplified = self._generate_simplified_interface(
                interface_data,
                analysis,
                user_preferences
            )
            
            return {
                'simplified_interface': simplified,
                'navigation_help': simplified['help'],
                'shortcuts': simplified['shortcuts']
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error simplifying interface: {str(e)}"
            )

    def _enhance_contrast(self, image: Image.Image) -> Image.Image:
        """Enhance image contrast for better visibility."""
        # Convert to numpy array
        img_array = np.array(image)
        
        # Convert to LAB color space
        lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
        
        # Split channels
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        
        # Merge channels
        limg = cv2.merge((cl,a,b))
        
        # Convert back to RGB
        enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
        
        return Image.fromarray(enhanced)

    def _magnify_image(
        self,
        image: Image.Image,
        scale: float = 1.5
    ) -> Image.Image:
        """Magnify image for better visibility."""
        width, height = image.size
        new_width = int(width * scale)
        new_height = int(height * scale)
        
        return image.resize((new_width, new_height), Image.LANCZOS)

    def _adapt_for_color_blindness(
        self,
        image: Image.Image,
        color_blind_type: str = 'deuteranopia'
    ) -> Image.Image:
        """Adapt image for color blindness."""
        # Convert to numpy array
        img_array = np.array(image)
        
        if color_blind_type == 'deuteranopia':
            # Adjust colors for red-green color blindness
            transformation = np.array([
                [0.625, 0.375, 0],
                [0.7, 0.3, 0],
                [0, 0.3, 0.7]
            ])
        elif color_blind_type == 'protanopia':
            # Adjust colors for red-blind color blindness
            transformation = np.array([
                [0.567, 0.433, 0],
                [0.558, 0.442, 0],
                [0, 0.242, 0.758]
            ])
        else:
            return image
        
        # Apply transformation
        adapted = np.dot(img_array, transformation.T)
        
        # Ensure values are in valid range
        adapted = np.clip(adapted, 0, 255).astype(np.uint8)
        
        return Image.fromarray(adapted)

    async def _analyze_image_details(
        self,
        image: Image.Image
    ) -> Dict[str, Any]:
        """Analyze image details for accessibility."""
        # Convert to numpy array
        img_array = np.array(image)
        
        # Analyze colors
        colors = self._analyze_color_distribution(img_array)
        
        # Analyze contrast
        contrast = self._analyze_contrast_ratio(img_array)
        
        # Analyze text
        text = await self._detect_text_in_image(img_array)
        
        return {
            'colors': colors,
            'contrast': contrast,
            'text': text
        }

    def _format_image_description(
        self,
        caption: str,
        details: Dict[str, Any]
    ) -> str:
        """Format image description for accessibility."""
        description_parts = [caption]
        
        # Add color information
        if details['colors']:
            description_parts.append(
                "The main colors in the image are: " +
                ", ".join(details['colors'])
            )
        
        # Add contrast information
        if details['contrast']:
            description_parts.append(
                f"The image has {details['contrast']} contrast."
            )
        
        # Add text information
        if details['text']:
            description_parts.append(
                "The image contains the following text: " +
                details['text']
            )
        
        return " ".join(description_parts)

    async def _analyze_screen_elements(
        self,
        screen: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Analyze screen elements for navigation."""
        elements = []
        
        for element in screen.get('elements', []):
            elements.append({
                'type': element.get('type'),
                'location': element.get('location'),
                'action': element.get('action'),
                'shortcut': element.get('shortcut'),
                'description': element.get('description')
            })
        
        return elements

    def _generate_navigation_instructions(
        self,
        elements: List[Dict[str, Any]],
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate navigation instructions."""
        instructions = {
            'text': "Here's how to navigate this screen: ",
            'shortcuts': [],
            'next_actions': []
        }
        
        for element in elements:
            # Add element description
            instructions['text'] += f"\n{element['description']}"
            
            # Add shortcut if available
            if element.get('shortcut'):
                instructions['shortcuts'].append({
                    'key': element['shortcut'],
                    'action': element['action']
                })
            
            # Add to next actions if interactive
            if element.get('action'):
                instructions['next_actions'].append(element['action'])
        
        return instructions

    async def _analyze_interface_complexity(
        self,
        interface: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze interface complexity."""
        # Count elements
        element_count = len(interface.get('elements', []))
        
        # Analyze interaction depth
        interaction_depth = self._analyze_interaction_depth(interface)
        
        # Analyze text complexity
        text_complexity = self._analyze_text_complexity(interface)
        
        return {
            'element_count': element_count,
            'interaction_depth': interaction_depth,
            'text_complexity': text_complexity
        }

    def _generate_simplified_interface(
        self,
        interface: Dict[str, Any],
        analysis: Dict[str, Any],
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate simplified interface version."""
        simplified = {
            'elements': [],
            'help': {},
            'shortcuts': []
        }
        
        # Simplify based on analysis
        if analysis['element_count'] > preferences.get('max_elements', 5):
            simplified['elements'] = self._reduce_elements(
                interface['elements'],
                preferences['max_elements']
            )
        
        # Add help information
        simplified['help'] = self._generate_help_info(simplified['elements'])
        
        # Add shortcuts
        simplified['shortcuts'] = self._generate_shortcuts(
            simplified['elements']
        )
        
        return simplified

    def _reduce_elements(
        self,
        elements: List[Dict[str, Any]],
        max_elements: int
    ) -> List[Dict[str, Any]]:
        """Reduce number of interface elements."""
        # Sort by importance
        sorted_elements = sorted(
            elements,
            key=lambda x: x.get('importance', 0),
            reverse=True
        )
        
        # Take top elements
        reduced = sorted_elements[:max_elements]
        
        # Add "More" option if needed
        if len(elements) > max_elements:
            reduced.append({
                'type': 'more',
                'action': 'show_more',
                'description': 'Show more options'
            })
        
        return reduced

    def _generate_help_info(
        self,
        elements: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate help information for simplified interface."""
        help_info = {
            'navigation': "Use arrow keys to move between elements. " +
                         "Press Enter to select.",
            'elements': {}
        }
        
        for element in elements:
            help_info['elements'][element['type']] = {
                'description': element['description'],
                'usage': f"Press {element.get('shortcut', 'Enter')} to {element['action']}"
            }
        
        return help_info

    def _generate_shortcuts(
        self,
        elements: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate shortcuts for simplified interface."""
        shortcuts = []
        
        for element in elements:
            if element.get('shortcut'):
                shortcuts.append({
                    'key': element['shortcut'],
                    'action': element['action'],
                    'description': element['description']
                })
        
        return shortcuts
