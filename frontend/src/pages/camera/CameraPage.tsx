import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType } from "@capacitor/camera";
import { useThemeStore } from "../../data-stores/theme.ts";
import { Try } from "jsr:@2or3godzillas/fp-try";
import { type FoodAnalysis, foodAnalysisSchema, foodApi } from "../../data-stores/api.ts";
import { useNavigate } from "react-router-dom";

type CameraPageProps = {
	onClose?: () => void;
};

export const CameraPage = ({ onClose }: CameraPageProps = {}) => {
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

	const isNative = Capacitor.isNativePlatform();

	const stopAllVideoStreams = () => {
		if (videoRef.current?.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => {
				track.stop();
			});
			videoRef.current.srcObject = null;
		}

		document.querySelectorAll("video").forEach((video) => {
			if (video.srcObject) {
				const stream = video.srcObject as MediaStream;
				stream.getTracks().forEach((track) => track.stop());
				video.srcObject = null;
			}
		});
	};

	const platformCamera = {
		native: {
			open: () => {
				Camera.getPhoto({
					resultType: CameraResultType.DataUrl,
					quality: 90,
					correctOrientation: true,
				}).then((capturedPhoto) => {
					setPhoto(capturedPhoto.dataUrl || null);
				});
			},
			close: () => {
			},
			capture: () => {
			},
		},

		web: {
			open: async () => {
				setIsCameraOpen(true);
			},
			close: () => {
				stopAllVideoStreams();
				setIsCameraOpen(false);
			},
			capture: () => {
				Try(async () => {
					if (!videoRef.current) throw new Error("No video element");
					if (!canvasRef.current) throw new Error("No canvas element");
					const video = videoRef.current;
					const canvas = canvasRef.current;
					const ctx = canvas.getContext("2d");
					if (!ctx) throw new Error("Failed to get canvas context");

					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
					setPhoto(canvas.toDataURL("image/jpeg", 0.9));
					stopAllVideoStreams();
					setIsCameraOpen(false);
				}).catch(() => setError("Failed to capture photo. Please try again."));
			},
		},
	};

	useEffect(() => {
		if (!isNative) {
			setIsCameraOpen(true);
		}

		return () => {
			stopAllVideoStreams();
		};
	}, [isNative]);

	useEffect(() => {
		if (isNative) return;
		if (!isCameraOpen) return;

		Try(async () => {
			if (!videoRef.current) throw new Error("No video element");

			const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
			videoRef.current.srcObject = stream;
			videoRef.current.play();
		}).catch(() => {
			setError("Unable to access webcam. Please check permissions.");
		});

		return () => {
			stopAllVideoStreams();
		};
	}, [isCameraOpen, isNative]);

	const camera = isNative ? platformCamera.native : platformCamera.web;

	const resetPhoto = () => {
		setPhoto(null);
		setAnalysis(null);
		setError(null);
		setIsCameraOpen(true);
	};

	const handleClose = () => {
		stopAllVideoStreams();

		if (onClose) {
			onClose();
		} else {
			navigate("/home", { replace: true });
		}
	};

	const analyzePhoto = async () => {
		if (!photo) return;

		setIsAnalyzing(true);
		setAnalysis(await foodApi.analyzeImage(photo));
		setIsAnalyzing(false);
	};

	const saveAnalysis = async () => {
		if (!analysis) return;

		setIsSaving(true);

		await Try(async () => {
			const parsedAnalysis = foodAnalysisSchema.parse(analysis);

			await foodApi.saveFoodEntry({
				...parsedAnalysis,
				imageUrl: photo || undefined,
			});
		});

		handleClose();
		setIsSaving(false);
	};

	return (
		<div className="px-5 pt-4 h-full">
			<h1 className="text-2xl font-bold mb-6">Food Scanner</h1>

			{error && (
				<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
					{error}
				</div>
			)}

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
						<div className="rounded-3xl overflow-hidden shadow-md">
							<img
								src={photo}
								alt="Captured food"
								className="w-full h-64 object-cover"
							/>
						</div>

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
									className={`rounded-3xl p-6 ${darkMode ? "bg-primary-secondary" : "bg-white"} shadow-sm border ${
										darkMode ? "border-gray-800" : "border-gray-100"
									}`}
								>
									<h2 className="text-xl font-bold mb-2">{analysis.name}</h2>
									<div className="flex items-center justify-between mb-4">
										<span className="text-2xl font-bold">{analysis.calories} cal</span>
										<button
											onClick={saveAnalysis}
											disabled={isSaving}
											className={`px-5 py-2 bg-appBlue text-white rounded-full shadow-sm ${
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
										className={`px-5 py-2 rounded-full ${darkMode ? "bg-primary-secondary" : "bg-gray-200"}`}
									>
										Retake
									</button>
									<button
										onClick={analyzePhoto}
										className="px-5 py-2 bg-appBlue text-white rounded-full shadow-sm"
									>
										Analyze Food
									</button>
								</div>
							)}
					</div>
				)
				: (
					<div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
						<div className={`p-16 rounded-3xl mb-6 ${darkMode ? "bg-primary-secondary" : "bg-gray-100"}`}>
							<span className="text-5xl">📷</span>
						</div>
						<p className="text-center text-gray-500 mb-8">
							Take a photo of your food to get an instant calorie estimate
						</p>
						<button
							onClick={camera.open}
							className="px-8 py-3 bg-appBlue text-white rounded-full shadow-md"
						>
							Open Camera
						</button>
					</div>
				)}

			<canvas ref={canvasRef} className="hidden"></canvas>
		</div>
	);
};
