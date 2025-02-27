// @deno-types="@types/react"
import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType } from "@capacitor/camera";
import { useThemeStore } from "../../data-stores/theme.ts";
import { Try } from "jsr:@2or3godzillas/fp-try";
import { type FoodAnalysis, foodApi } from "../../data-stores/api.ts";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

interface CameraPageProps {
	onClose?: () => void;
}

const CameraPage = ({ onClose }: CameraPageProps = {}) => {
	const { darkMode } = useThemeStore();
	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const [photo, setPhoto] = useState<string | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
	const [error, setError] = useState<string | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const navigate = useNavigate();

	// Determine if we're running on a native platform
	const isNative = Capacitor.isNativePlatform();

	// Function to force stop all camera streams
	const stopAllVideoStreams = () => {
		// Close the stream on our video element
		if (videoRef.current?.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => {
				track.stop();
			});
			videoRef.current.srcObject = null;
		}

		// Also find any other potential video elements with active streams
		document.querySelectorAll("video").forEach((video) => {
			if (video.srcObject) {
				const stream = video.srcObject as MediaStream;
				stream.getTracks().forEach((track) => track.stop());
				video.srcObject = null;
			}
		});
	};

	// Platform-specific camera handlers
	const platformCamera = {
		// Native platform (iOS/Android) camera handlers
		native: {
			open: async () => {
				const capturedPhoto = await Try(() => (
					Camera.getPhoto({
						resultType: CameraResultType.DataUrl,
						quality: 90,
						correctOrientation: true,
					})
				));

				if (capturedPhoto.failure) {
					console.error("Camera error:", capturedPhoto.error);
					setError("Unable to access camera. Please check permissions.");
					return;
				}

				setPhoto(capturedPhoto.data.dataUrl || null);
			},
			close: () => {
				// Nothing to close on native platforms as the camera UI is managed by the OS
			},
			capture: () => {
				// Not needed for native as capture happens in the open function
			},
		},

		// Web platform camera handlers
		web: {
			open: async () => {
				setIsCameraOpen(true);
				// Webcam is started in the useEffect when isCameraOpen becomes true
			},
			close: () => {
				stopAllVideoStreams();
				setIsCameraOpen(false);
			},
			capture: () => {
				if (!videoRef.current || !canvasRef.current) return;

				try {
					const video = videoRef.current;
					const canvas = canvasRef.current;
					const ctx = canvas.getContext("2d");
					if (!ctx) throw new Error("Failed to get canvas context");

					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
					setPhoto(canvas.toDataURL("image/jpeg", 0.9)); // Use JPEG with 90% quality
					stopAllVideoStreams();
					setIsCameraOpen(false);
				} catch (error) {
					console.error("Error capturing photo:", error);
					setError("Failed to capture photo. Please try again.");
				}
			},
		},
	};

	// Initialize camera
	useEffect(() => {
		// Auto-open webcam on web platforms
		if (!isNative) {
			setIsCameraOpen(true);
		}

		// Cleanup when component unmounts
		return () => {
			stopAllVideoStreams();
		};
	}, [isNative]);

	// Handle webcam starting
	useEffect(() => {
		if (!isCameraOpen || isNative) return;

		// Start webcam
		const startWebcam = async () => {
			if (!videoRef.current) return;

			try {
				// Stop any existing streams first
				stopAllVideoStreams();

				// Start a new stream
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "environment" },
				});

				if (videoRef.current) { // Check again in case component unmounted during await
					videoRef.current.srcObject = stream;
					videoRef.current.play();
				} else {
					// If component unmounted, stop the stream we just created
					stream.getTracks().forEach((track) => track.stop());
				}
			} catch (error) {
				console.error("Webcam error:", error);
				setError("Unable to access webcam. Please check permissions.");
			}
		};

		startWebcam();

		// Cleanup when isCameraOpen becomes false
		return () => {
			stopAllVideoStreams();
		};
	}, [isCameraOpen, isNative]);

	// Choose the appropriate camera handler based on platform
	const camera = isNative ? platformCamera.native : platformCamera.web;

	// Reset photo and analysis state
	const resetPhoto = () => {
		setPhoto(null);
		setAnalysis(null);
		setError(null);
		setIsCameraOpen(true);
	};

	// Handle closing the camera component (called by parent or when exiting camera)
	const handleClose = () => {
		// First, stop all video streams
		stopAllVideoStreams();

		// Then call the onClose prop if it exists
		if (onClose) {
			onClose();
		} else {
			// If no onClose prop, just navigate back to dashboard
			navigate("/dashboard", { replace: true });
		}
	};

	const analyzePhoto = async () => {
		if (!photo) return;

		setIsAnalyzing(true);
		setError(null);

		try {
			// Call the API to analyze the image
			const analysisResult = await foodApi.analyzeImage(photo);

			// Define and validate the analysis result schema
			const analysisSchema = z.object({
				name: z.string(),
				calories: z.number(),
				ingredients: z.array(z.object({
					name: z.string(),
					calories: z.number(),
					percentage: z.number(),
				})),
			});

			const parsedAnalysis = analysisSchema.safeParse(analysisResult);
			if (!parsedAnalysis.success) throw new Error("Invalid analysis result returned from API");

			setAnalysis(parsedAnalysis.data);
		} catch (error: any) {
			console.error("Error analyzing photo:", error);

			// Try to extract meaningful error message if available
			let errorMessage = "Failed to analyze image. Please try again or take another photo.";

			if (error.response?.data?.error) {
				errorMessage = `Analysis failed: ${error.response.data.error}`;
			} else if (error.message) {
				errorMessage = `Analysis failed: ${error.message}`;
			}

			setError(errorMessage);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const saveAnalysis = async () => {
		if (!analysis) return;

		setIsSaving(true);
		setError(null);

		try {
			// Validate analysis data before saving
			const analysisSchema = z.object({
				name: z.string(),
				calories: z.number(),
				ingredients: z.array(z.object({
					name: z.string(),
					calories: z.number(),
					percentage: z.number(),
				})),
			});

			const parsedAnalysis = analysisSchema.parse(analysis, {
				errorMap: () => ({ message: "Invalid food data. Please try analyzing again." }),
			});

			// Save the food entry using the API
			const savedEntry = await foodApi.saveFoodEntry({
				...parsedAnalysis,
				imageUrl: photo || undefined,
			});

			// Verify we got a valid response with an ID
			if (!savedEntry.id) throw new Error("Invalid response from server when saving.");

			// Close the camera component when done
			handleClose();
		} catch (error: any) {
			console.error("Error saving food entry:", error);

			// Try to extract meaningful error message if available
			let errorMessage = "Failed to save food entry. Please try again.";

			if (error.response?.data?.error) {
				errorMessage = `Save failed: ${error.response.data.error}`;
			} else if (error.message) {
				errorMessage = `Save failed: ${error.message}`;
			}

			setError(errorMessage);
			setIsSaving(false);
		}
	};

	return (
		<div className="px-5 pt-4 h-full">
			<h1 className="text-2xl font-bold mb-6">Food Scanner</h1>

			{error && (
				<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
					{error}
				</div>
			)}

			{/* Camera experience */}
			{isCameraOpen && !isNative
				? (
					<div className="relative h-[calc(100vh-200px)] rounded-3xl overflow-hidden">
						<video
							ref={videoRef}
							className="w-full h-full object-cover"
							playsInline
							muted
						>
						</video>

						<div className="absolute inset-0 border-2 border-white rounded-3xl pointer-events-none"></div>

						{/* Camera guides */}
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect
									x="0"
									y="0"
									width="200"
									height="200"
									rx="20"
									stroke="white"
									strokeWidth="4"
									strokeDasharray="20 10"
									fill="none"
								/>
							</svg>
						</div>

						<div className="absolute bottom-6 left-0 right-0 flex justify-center">
							<button
								onClick={camera.capture}
								className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg"
							>
							</button>
						</div>
					</div>
				)
				: photo
				? (
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
						{isAnalyzing
							? (
								<div className="flex flex-col items-center justify-center p-6">
									<div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4">
									</div>
									<p>Analyzing your food...</p>
								</div>
							)
							: analysis
							? (
								<div
									className={`rounded-3xl p-6 ${darkMode ? "bg-dark-secondary" : "bg-white"} shadow-sm border ${
										darkMode ? "border-gray-800" : "border-gray-100"
									}`}
								>
									<h2 className="text-xl font-bold mb-2">{analysis.name}</h2>
									<div className="flex items-center justify-between mb-4">
										<span className="text-2xl font-bold">{analysis.calories} cal</span>
										<button
											onClick={saveAnalysis}
											disabled={isSaving}
											className={`px-5 py-2 bg-primary text-white rounded-full shadow-sm ${
												isSaving ? "opacity-70" : ""
											}`}
										>
											{isSaving ? "Saving..." : "Save Entry"}
										</button>
									</div>

									<h3 className="font-medium mb-2">Ingredients:</h3>
									<div className="space-y-2">
										{analysis.ingredients.map((ingredient, index) => (
											<div key={index} className="flex justify-between items-center">
												<div className="flex items-center">
													<div
														className={`w-12 h-2 rounded-full mr-3 ${
															["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500"][index % 5]
														}`}
													>
													</div>
													<span>{ingredient.name}</span>
												</div>
												<div className="text-right">
													<span className="font-medium">{ingredient.calories} cal</span>
													<span className={`ml-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
														({ingredient.percentage}%)
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
							)
							: (
								<div className="flex justify-between">
									<button
										onClick={resetPhoto}
										className={`px-5 py-2 rounded-full ${darkMode ? "bg-dark-secondary" : "bg-gray-200"}`}
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
				)
				: (
					<div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
						<div className={`p-16 rounded-3xl mb-6 ${darkMode ? "bg-dark-secondary" : "bg-gray-100"}`}>
							<span className="text-5xl">📷</span>
						</div>
						<p className="text-center text-gray-500 mb-8">
							Take a photo of your food to get an instant calorie estimate
						</p>
						<button
							onClick={camera.open}
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
