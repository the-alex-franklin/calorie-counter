// @deno-types="@types/react"
import { useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType } from "@capacitor/camera";
import { Transition } from "@headlessui/react";

export const Dashboard = () => {
	const [photo, setPhoto] = useState<string | null>(null);
	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	// Open camera (native or web)
	const openCamera = async () => {
		if (Capacitor.isNativePlatform()) {
			try {
				const capturedPhoto = await Camera.getPhoto({
					resultType: CameraResultType.Uri,
					quality: 80,
				});
				setPhoto(capturedPhoto.webPath || null);
			} catch (error) {
				console.error("Camera error:", error);
			}
		} else {
			setIsCameraOpen(true);
			startWebcam();
		}
	};

	// Start webcam (for web)
	const startWebcam = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.play();
			}
		} catch (error) {
			console.error("Webcam error:", error);
		}
	};

	// Capture photo from webcam
	const captureWebcamPhoto = () => {
		if (!videoRef.current || !canvasRef.current) return;

		const video = videoRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

		setPhoto(canvas.toDataURL("image/png"));
		closeCamera();
	};

	// Close camera view
	const closeCamera = () => {
		if (videoRef.current?.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => track.stop());
		}
		setIsCameraOpen(false);
	};

	return (
		<div className="h-full w-full flex flex-col items-center justify-center bg-gray-100 text-gray-900">
			<h1 className="text-3xl font-bold mb-4">AI Calorie Counter</h1>

			{photo
				? (
					<div className="flex flex-col items-center">
						<div className="w-64 flex items-center justify-center bg-gray-200 rounded-lg shadow-[16px_16px_16px_rgba(0,0,0,1)] mb-24 overflow-hidden">
							<img src={photo} alt="Captured" className="max-w-full h-auto object-contain" />
						</div>
						<button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded" onClick={() => setPhoto(null)}>
							Retake Photo
						</button>
					</div>
				)
				: (
					<button className="bg-blue-500 text-white px-6 py-2 rounded" onClick={openCamera}>
						Open Camera
					</button>
				)}

			{/* Camera View (Full Page) */}
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

					{/* Controls */}
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

			{/* Hidden Canvas for Capturing Webcam Photo */}
			<canvas ref={canvasRef} className="hidden"></canvas>
		</div>
	);
};
