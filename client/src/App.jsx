import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam'; // THE REAL CAMERA
import useInterview from './hooks/useInterview'; // YOUR AI BRAIN
import { 
  Video, Mic, MicOff, VideoOff, Play, Square, Eye, Activity, 
  TrendingUp, Lightbulb, Volume2, AlertTriangle 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  // 1. PULL IN THE BRAIN (Your Hook)
  const {
    aiResponse,
    loading,
    webcamRef,
    transcript,
    listening,
    startListening,
    stopListening,
    analyzeCandidate,
    resetTranscript
  } = useInterview();

  // 2. UI STATE (The Skin)
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isStressMode, setIsStressMode] = useState(false); // The Stranger Things Toggle

  // 3. REAL-TIME STATS LOGIC
  // Count words to calculate pace
  const wordCount = transcript.split(' ').length;
  // Calculate WPM (Words Per Minute)
  const wpm = timeElapsed > 0 ? Math.round((wordCount / timeElapsed) * 60) : 0;
  // Count Filler words (um, uh, like)
  const fillerCount = (transcript.match(/\b(um|uh|like|so|actually)\b/gi) || []).length;
  // Calculate a "Live Confidence Score" based on filler words
  // Starts at 10, drops by 0.5 for every filler word
  const confidenceScore = Math.max(0, 10 - (fillerCount * 0.5)).toFixed(1);

  // Timer Effect (Only runs when YOU are listening)
  useEffect(() => {
    let interval;
    if (listening) {
      interval = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    } else {
      setTimeElapsed(0);
    }
    return () => clearInterval(interval);
  }, [listening]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full transition-colors duration-700" 
         style={{ backgroundColor: '#0B0F19' }}>
      
      {/* --- STRESS MODE OVERLAY (THE UPSIDE DOWN) --- */}
      {isStressMode && (
        <div className="fixed inset-0 pointer-events-none z-50 border-4 animate-pulse" 
          style={{ borderColor: '#FF3D00' }}></div>
      )}
      
      <div className="min-h-screen flex flex-col">
        {/* --- HEADER --- */}
        <header className="border-b px-8 py-4" style={{ borderColor: '#1B263B' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00E5FF' }}>
                <Video className="w-5 h-5" style={{ color: '#0B0F19' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold" style={{ color: '#E0E6ED' }}>
                  Mock-Mate AI
                </h1>
                <p className="text-sm" style={{ color: '#8892A3' }}>
                  Software Engineer Position
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* STRESS MODE BADGE */}
              {isStressMode && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" 
                  style={{ backgroundColor: 'rgba(255, 61, 0, 0.1)', border: '1px solid #FF3D00' }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: '#FF3D00' }} />
                  <span className="text-sm font-medium" style={{ color: '#FF3D00' }}>Stress Mode Active</span>
                </div>
              )}
              
              <div className="text-sm" style={{ color: '#8892A3' }}>
                Live Interview Session
              </div>
              <div className="px-4 py-2 rounded-lg font-mono text-lg font-semibold" style={{ backgroundColor: '#1B263B', color: '#00E5FF' }}>
                {formatTime(timeElapsed)}
              </div>
            </div>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 grid grid-cols-3 gap-6 p-8">
          
          {/* LEFT COLUMN - INTERVIEW SECTION */}
          <div className="col-span-2 flex flex-col gap-6">
            
            {/* 1. CAMERA FEED (Real Webcam) */}
            <div className="relative rounded-2xl overflow-hidden bg-black" 
                 style={{ height: '360px', border: isStressMode ? '2px solid #FF3D00' : 'none' }}>
              
              {isVideoOn ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  mirror={true}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <VideoOff className="w-12 h-12 mb-2 opacity-50" />
                  <p>Camera Off</p>
                </div>
              )}

              {/* RECORDING INDICATOR */}
              {listening && (
                 <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 bg-black/60 text-white backdrop-blur-sm border border-red-500/30">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FF3D00' }}></span>
                  Recording Analysis...
                </div>
              )}

              {/* HUD OVERLAY */}
              {listening && (
                <div className="absolute inset-0 pointer-events-none border-2 rounded-2xl" 
                  style={{ borderColor: isStressMode ? '#FF3D00' : '#00E5FF', opacity: 0.3 }}></div>
              )}
            </div>

            {/* 2. AI INTERVIEWER SECTION */}
            <div className="flex-1 rounded-2xl p-8 transition-colors duration-500" 
                 style={{ backgroundColor: isStressMode ? 'rgba(255, 61, 0, 0.05)' : '#1B263B' }}>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 relative"
                  style={{ backgroundColor: isStressMode ? '#FF3D00' : '#00E5FF' }}>
                  <Volume2 className="w-6 h-6" style={{ color: '#0B0F19' }} />
                  {/* PING ANIMATION WHEN AI SPEAKS/LOADS */}
                  {loading && (
                    <div className="absolute inset-0 rounded-full animate-ping" 
                      style={{ backgroundColor: isStressMode ? '#FF3D00' : '#00E5FF', opacity: 0.4 }}></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#E0E6ED' }}>
                    {loading ? "AI is Thinking..." : "AI Interviewer"}
                  </h3>
                  
                  {/* AI RESPONSE TEXT */}
                  <div className="text-lg leading-relaxed prose prose-invert" style={{ color: '#E0E6ED' }}>
                    <ReactMarkdown>{aiResponse || "Press Start..."}</ReactMarkdown>
                  </div>
                

                  {/* CONTROL BUTTONS */}
                  <div className="pt-8 flex gap-3">
                    <button
                      onClick={listening ? stopListening : startListening}
                      className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:opacity-90 hover:scale-105 active:scale-95"
                      style={{ 
                        backgroundColor: listening ? '#FF3D00' : '#00E5FF', 
                        color: '#0B0F19' 
                      }}>
                      {listening ? (
                        <>
                          <Square className="w-4 h-4" /> Stop & Send
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" /> Start Answer
                        </>
                      )}
                    </button>
                    
                    {/* Manual Analyze Button */}
                    <button
                      onClick={analyzeCandidate}
                      className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 border transition-all hover:bg-white/5"
                      style={{ borderColor: '#293548', color: '#E0E6ED' }}>
                       <Eye className="w-4 h-4" /> Analyze Face Only
                    </button>

                    <button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className="px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:opacity-80 border"
                      style={{ 
                        borderColor: '#1B263B',
                        backgroundColor: isVideoOn ? '#1B263B' : '#0B0F19',
                        color: '#E0E6ED'
                      }}>
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - LIVE FEEDBACK */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            <h2 className="text-lg font-semibold px-2" style={{ color: '#E0E6ED' }}>
              Live Stats
            </h2>

            {/* STRESS MODE TOGGLE SWITCH */}
            <div className="rounded-xl p-5 border transition-all duration-300" 
              style={{ 
                backgroundColor: '#1B263B', 
                borderColor: isStressMode ? '#FF3D00' : '#00E676',
                boxShadow: isStressMode ? '0 0 12px rgba(255, 61, 0, 0.15)' : '0 0 0 transparent'
              }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium mb-1 transition-colors duration-300" 
                    style={{ color: isStressMode ? '#FF3D00' : '#00E676' }}>
                    {isStressMode ? 'Stress Mode ON' : 'Normal Mode'}
                  </h3>
                  <p className="text-xs" style={{ color: '#8892A3' }}>
                    {isStressMode ? 'Simulating High Pressure' : 'Standard Interview Pace'}
                  </p>
                </div>
                
                {/* Custom Toggle Switch */}
                <button
                  onClick={() => setIsStressMode(!isStressMode)}
                  className="relative flex-shrink-0 ml-4 transition-all duration-300"
                  style={{
                    width: '56px',
                    height: '32px',
                    backgroundColor: isStressMode ? 'rgba(255, 61, 0, 0.2)' : 'rgba(0, 230, 118, 0.2)',
                    border: `2px solid ${isStressMode ? '#FF3D00' : '#00E676'}`,
                    borderRadius: '16px',
                    cursor: 'pointer'
                  }}>
                  <div
                    className="absolute top-0.5 transition-all duration-300 ease-in-out"
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: isStressMode ? '#FF3D00' : '#00E676',
                      borderRadius: '50%',
                      transform: isStressMode ? 'translateX(24px)' : 'translateX(2px)',
                      boxShadow: isStressMode 
                        ? '0 2px 8px rgba(255, 61, 0, 0.4)' 
                        : '0 2px 4px rgba(0, 230, 118, 0.3)'
                    }}
                  />
                </button>
              </div>
            </div>

            {/* SPEECH PACE CARD (REAL DATA) */}
            <div className="rounded-xl p-5 border" 
              style={{ backgroundColor: '#1B263B', borderColor: '#293548' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0, 229, 255, 0.1)' }}>
                  <Activity className="w-5 h-5" style={{ color: '#00E5FF' }} />
                </div>
                <h3 className="font-medium" style={{ color: '#E0E6ED' }}>Speech Pace</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: '#8892A3' }}>{wpm} words/min</span>
                  <span style={{ color: '#00E676' }}>
                    {wpm > 120 && wpm < 160 ? "Optimal" : wpm > 160 ? "Too Fast" : "Too Slow"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0B0F19' }}>
                  <div className="h-full rounded-full transition-all duration-500" 
                    style={{ backgroundColor: '#00E676', width: `${Math.min(wpm/2, 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* CONFIDENCE CARD (REAL DATA) */}
            <div className="rounded-xl p-5 border" 
              style={{ backgroundColor: '#1B263B', borderColor: '#293548' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0, 229, 255, 0.1)' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#00E5FF' }} />
                </div>
                <h3 className="font-medium" style={{ color: '#E0E6ED' }}>Confidence</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: '#8892A3' }}>Live Score</span>
                  <span style={{ color: isStressMode ? '#FF3D00' : '#00E676' }}>
                    {confidenceScore}/10
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0B0F19' }}>
                  <div className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      backgroundColor: isStressMode ? '#FF3D00' : '#00E676', 
                      width: `${confidenceScore * 10}%` 
                    }}></div>
                </div>
              </div>
            </div>

            {/* SESSION STATS (REAL DATA) */}
            <div className="rounded-xl p-5 border" 
              style={{ backgroundColor: '#1B263B', borderColor: '#293548' }}>
              <h3 className="font-medium mb-4" style={{ color: '#E0E6ED' }}>Session Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: '#8892A3' }}>Filler Words</p>
                  <p className="text-2xl font-semibold" style={{ color: fillerCount > 5 ? '#FF3D00' : '#E0E6ED' }}>
                    {fillerCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: '#8892A3' }}>Transcript</p>
                  <p className="text-sm truncate text-gray-400">
                    {transcript || "..."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}