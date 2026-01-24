import { useState, useRef, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';

const useInterview = () => {
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Voice Function (Text-to-Speech)
  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Try to find a nice English voice
    utterance.voice = voices.find(v => v.lang.includes('en-US')) || voices[0];
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = async () => {
    SpeechRecognition.stopListening();
    if (transcript) {
      await sendToBackend(transcript);
    }
  };

  const analyzeCandidate = async () => {
    // Manual trigger if they want to analyze face without speaking
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    await sendToBackend("", imageSrc);
  };

  const sendToBackend = async (text, manualImage = null) => {
    setLoading(true);
    let imageSrc = manualImage;
    
    // If no manual image, try to grab one from webcam
    if (!imageSrc && webcamRef.current) {
      imageSrc = webcamRef.current.getScreenshot();
    }

    try {
      const { data } = await axios.post('http://localhost:5000/api/chat', {
        userMessage: text || "(No speech, just visual analysis)",
        image: imageSrc
      });

      setAiResponse(data.reply);
      speakText(data.reply); // Make the AI speak!
    } catch (error) {
      console.error("Error:", error);
      setAiResponse("Server connection failed. Is the backend running?");
    }
    setLoading(false);
  };

  return {
    aiResponse,
    loading,
    webcamRef,
    transcript,
    listening,
    startListening,
    stopListening,
    analyzeCandidate,
    resetTranscript,
    browserSupportsSpeechRecognition
  };
};

export default useInterview;