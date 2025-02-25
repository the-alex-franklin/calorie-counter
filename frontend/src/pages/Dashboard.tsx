// @deno-types="@types/react"
import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType } from "@capacitor/camera";
import { useThemeStore } from "../data-stores/theme.ts";
import { Navbar } from "../components/Navbar.tsx";
import { Try } from "jsr:@2or3godzillas/fp-try";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export const Dashboard = () => {
	const { darkMode } = useThemeStore();
	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const [photo, setPhoto] = useState<string | null>(null);
	const [calories, setCalories] = useState(0);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (isCameraOpen) startWebcam();
	}, [isCameraOpen]);

	useEffect(() => {
		fetchCalories();
	}, []);

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
		if (!videoRef.current) throw new Error("Video element not found");

		const streamResult = await Try(() => navigator.mediaDevices.getUserMedia({ video: true }));
		if (streamResult.failure) {
			console.error("Webcam error:", streamResult.error);
			return;
		}

		videoRef.current.srcObject = streamResult.data;
		videoRef.current.play();
	};

	const captureWebcamPhoto = () => {
		Try(() => {
			if (!videoRef.current) throw new Error("videoRef does not exist");
			if (!canvasRef.current) throw new Error("canvasRef does not exist");

			const video = videoRef.current;
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Failed to get canvas context");

			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			setPhoto(canvas.toDataURL("image/png"));
		});

		closeCamera();
	};

	const closeCamera = () => {
		if (videoRef.current) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => track.stop());
		}
		setIsCameraOpen(false);
	};

	const fetchCalories = async () => {
		// Replace with actual API call
		const fetchedCalories = await Promise.resolve(1200);
		setCalories(fetchedCalories);
	};

	return (
		<div
			className={`h-full w-full ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} transition-all`}
		>
			<Navbar />

			<div className="flex flex-col items-center justify-center h-[calc(100vh-60px)] p-4 pb-16">
				<h1 className="text-4xl font-bold tracking-wide mb-6">AI Calorie Counter</h1>

				<div className="w-64 h-64 mb-6">
					<CircularProgressbar
						value={calories}
						maxValue={2000} // Assuming 2000 is the daily goal
						text={`${calories} kcal`}
						styles={buildStyles({
							textColor: darkMode ? "#fff" : "#000",
							pathColor: calories > 2000 ? "red" : "green",
							trailColor: darkMode ? "#333" : "#ddd",
						})}
					/>
				</div>

				{photo
					? (
						<div className="flex flex-col items-center">
							<div className="w-64 flex items-center justify-center bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden">
								<img src={photo} alt="Captured" className="max-w-full h-auto object-contain" />
							</div>
							<button
								className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
								onClick={() => setPhoto(null)}
							>
								Retake Photo
							</button>
						</div>
					)
					: (
						<button
							className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
							onClick={openCamera}
						>
							Open Camera
						</button>
					)}

				{isCameraOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300">
						<video ref={videoRef} className="w-full h-full object-cover"></video>

						<div className="absolute bottom-10 flex gap-6">
							<button
								className="bg-white text-gray-900 px-6 py-2 rounded-full shadow-md hover:bg-gray-100 transition-all"
								onClick={closeCamera}
							>
								Cancel
							</button>
							<button
								className="bg-green-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-400 transition-all"
								onClick={captureWebcamPhoto}
							>
								Snap Picture
							</button>
						</div>
					</div>
				)}
				<canvas ref={canvasRef} className="hidden"></canvas>
			</div>
		</div>
	);
};
