// @deno-types="@types/react"
import { useRef, useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType } from "@capacitor/camera";
import { useThemeStore } from "../../data-stores/theme.ts";
import { Try } from "jsr:@2or3godzillas/fp-try";

// Food analysis data type
interface FoodAnalysis {
  name: string;
  calories: number;
  ingredients: Array<{
    name: string;
    calories: number;
    percentage: number;
  }>;
}

const CameraPage = () => {
  const { darkMode } = useThemeStore();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Open the camera on load if it's not a native platform
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setIsCameraOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isCameraOpen) startWebcam();
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    };
  }, [isCameraOpen]);

  const openCamera = async () => {
    if (Capacitor.isNativePlatform()) {
      const capturedPhoto = await Try(() => (
        Camera.getPhoto({
          resultType: CameraResultType.Uri,
          quality: 80,
        })
      ));

      if (capturedPhoto.failure) {
        console.error("Camera error:", capturedPhoto.error);
        return;
      }

      setPhoto(capturedPhoto.data.webPath || null);
    } else {
      setIsCameraOpen(true);
    }
  };

  const startWebcam = async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      console.error("Webcam error:", error);
    }
  };

  const captureWebcamPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL("image/png"));
      closeCamera();
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  const closeCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
    setIsCameraOpen(false);
  };

  const resetPhoto = () => {
    setPhoto(null);
    setAnalysis(null);
    setIsCameraOpen(true);
  };

  const analyzePhoto = async () => {
    if (!photo) return;

    setIsAnalyzing(true);
    try {
      // Mock analysis - in a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalysis({
        name: "Grilled Chicken Salad",
        calories: 420,
        ingredients: [
          { name: "Grilled Chicken", calories: 210, percentage: 50 },
          { name: "Mixed Greens", calories: 40, percentage: 25 },
          { name: "Tomatoes", calories: 30, percentage: 10 },
          { name: "Olive Oil", calories: 120, percentage: 10 },
          { name: "Cucumber", calories: 20, percentage: 5 }
        ]
      });

    } catch (error) {
      console.error("Error analyzing photo:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysis = () => {
    // In a real app, this would save to your database
    alert("Analysis saved successfully!");
    setPhoto(null);
    setAnalysis(null);
  };

  return (
    <div className="px-5 pt-4 h-full">
      <h1 className="text-2xl font-bold mb-6">Food Scanner</h1>
      
      {/* Camera experience */}
      {isCameraOpen ? (
        <div className="relative h-[calc(100vh-200px)] rounded-3xl overflow-hidden">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            playsInline
            muted
          ></video>
          
          <div className="absolute inset-0 border-2 border-white rounded-3xl pointer-events-none"></div>
          
          {/* Camera guides */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="200" height="200" rx="20" 
                stroke="white" strokeWidth="4" strokeDasharray="20 10" fill="none" />
            </svg>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <button
              onClick={captureWebcamPhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg"
            ></button>
          </div>
        </div>
      ) : photo ? (
        <div className="space-y-6">
          {/* Photo preview */}
          <div className="rounded-3xl overflow-hidden shadow-md">
            <img 
              src={photo} 
              alt="Captured food" 
              className="w-full h-64 object-cover"
            />
          </div>
          
          {/* Analysis results */}
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center p-6">
              <div className="ios-spinner mb-4"></div>
              <p>Analyzing your food...</p>
            </div>
          ) : analysis ? (
            <div className={`rounded-3xl p-6 ${darkMode ? 'bg-dark-secondary' : 'bg-white'} 
              shadow-sm border ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <h2 className="text-xl font-bold mb-2">{analysis.name}</h2>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">{analysis.calories} cal</span>
                <button 
                  onClick={saveAnalysis}
                  className="px-5 py-2 bg-primary text-white rounded-full shadow-sm"
                >
                  Save Entry
                </button>
              </div>
              
              <h3 className="font-medium mb-2">Ingredients:</h3>
              <div className="space-y-2">
                {analysis.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-12 h-2 rounded-full mr-3 ${
                        ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500'][index % 5]
                      }`}></div>
                      <span>{ingredient.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{ingredient.calories} cal</span>
                      <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({ingredient.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <button
                onClick={resetPhoto}
                className={`px-5 py-2 rounded-full ${darkMode ? 'bg-dark-secondary' : 'bg-gray-200'}`}
              >
                Retake
              </button>
              <button
                onClick={analyzePhoto}
                className="px-5 py-2 bg-primary text-white rounded-full shadow-sm"
              >
                Analyze Food
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className={`p-16 rounded-3xl mb-6 ${darkMode ? 'bg-dark-secondary' : 'bg-gray-100'}`}>
            <span className="text-5xl">📷</span>
          </div>
          <p className="text-center text-gray-500 mb-8">
            Take a photo of your food to get an instant calorie estimate
          </p>
          <button
            onClick={openCamera}
            className="px-8 py-3 bg-primary text-white rounded-full shadow-md"
          >
            Open Camera
          </button>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default CameraPage;