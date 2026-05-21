import React, { useState } from 'react'
import { Mic, Square, Volume2 } from 'lucide-react'

const VoiceChat: React.FC = () => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')

  const toggleListening = () => {
    setIsListening(!isListening)
    if (!isListening) {
      // 模拟语音识别
      setTimeout(() => {
        setTranscript('你好，这是一个语音识别测试...')
        setTimeout(() => {
          setIsListening(false)
          // 模拟语音合成
          setIsSpeaking(true)
          setTimeout(() => {
            setIsSpeaking(false)
          }, 2000)
        }, 1500)
      }, 500)
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="flex flex-col items-center gap-3">
        {/* Status Display */}
        {(isListening || isSpeaking) && (
          <div className="card animate-bounce">
            <div className="flex items-center gap-3">
              {isListening && <Mic className="w-5 h-5 text-red-500 animate-pulse" />}
              {isSpeaking && <Volume2 className="w-5 h-5 text-green-500 animate-pulse" />}
              <span className="text-sm">
                {isListening ? '正在听...' : isSpeaking ? '正在说...' : ''}
              </span>
            </div>
            {transcript && (
              <p className="mt-2 text-xs text-slate-400 max-w-xs">{transcript}</p>
            )}
          </div>
        )}

        {/* Voice Button */}
        <button
          onClick={toggleListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : isSpeaking
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gradient-to-br from-indigo-600 to-pink-500 hover:from-indigo-700 hover:to-pink-600'
          }`}
        >
          {isListening ? (
            <Square className="w-6 h-6 text-white" />
          ) : isSpeaking ? (
            <Volume2 className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>
        <span className="text-xs text-slate-500">语音对话</span>
      </div>
    </div>
  )
}

export default VoiceChat
