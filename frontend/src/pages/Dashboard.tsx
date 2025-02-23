// @deno-types="@types/react"
import { useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType } from "@capacitor/camera";
import { Transition } from "@headlessui/react";
import { useThemeStore } from "../data-stores/theme.ts"; // Ensure correct path
import { Navbar } from "../components/Navbar.tsx"; // Import the Navbar component
import { Try } from "jsr:@2or3godzillas/fp-try";

export const Dashboard = () => {
	const { darkMode } = useThemeStore();
	const [photo, setPhoto] = useState<string | null>(null);
	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	// Open camera (native or web)
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
			await startWebcam();
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
		if (!videoRef.current) return;
		if (!canvasRef.current) return;

		const video = videoRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

		setPhoto(canvas.toDataURL("image/png"));
		closeCamera();
	};

	const closeCamera = () => {
		if (videoRef.current?.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => track.stop());
		}

		setIsCameraOpen(false);
	};

	return (
		<div className={`h-full w-full ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
			<Navbar />

			<div className="flex flex-col items-center justify-center h-[calc(100vh-60px)] p-4">
				<h1 className="text-3xl font-bold mb-4">AI Calorie Counter</h1>

				{photo
					? (
						<div className="flex flex-col items-center">
							<div className="w-64 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg mb-6 overflow-hidden">
								<img src={photo} alt="Captured" className="max-w-full h-auto object-contain" />
							</div>
							<button className="mt-4 bg-primary text-primary px-6 py-2 rounded" onClick={() => setPhoto(null)}>
								Retake Photo
							</button>
						</div>
					)
					: (
						<button className="bg-primary text-primary px-6 py-2 rounded" onClick={openCamera}>
							Open Camera
						</button>
					)}

				<Transition
					show={isCameraOpen}
					enter="transition-opacity duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="transition-opacity duration-300"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
						<video ref={videoRef} className="w-full h-full object-cover"></video>

						<div className="absolute bottom-10 flex gap-6">
							<button className="bg-red-500 text-white px-6 py-2 rounded-lg" onClick={closeCamera}>
								Cancel
							</button>
							<button className="bg-green-500 text-white px-6 py-2 rounded-lg" onClick={captureWebcamPhoto}>
								Snap Picture
							</button>
						</div>
					</div>
				</Transition>

				<canvas ref={canvasRef} className="hidden"></canvas>
			</div>
		</div>
	);
};
