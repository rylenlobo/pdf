import { useCallback, useLayoutEffect, useRef } from "react";
import { useDebounce } from "use-debounce";

import { usePdf } from "../../internal";
import { useDpr } from "../useDpr";
import { usePDFPageNumber } from "../usePdfPageNumber";

export const useCanvasLayer = ({ background }: { background?: string }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const pageNumber = usePDFPageNumber();
	const dpr = useDpr();

	const bouncyZoom = usePdf((state) => state.zoom);
	const pdfPageProxy = usePdf((state) => state.getPdfPageProxy(pageNumber));

	const [zoom] = useDebounce(bouncyZoom, 100);

	useLayoutEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const baseCanvas = canvasRef.current;
		const baseViewport = pdfPageProxy.getViewport({ scale: 1 });
		const pageWidth = baseViewport.width;
		const pageHeight = baseViewport.height;

		// REMOVED CLAMPING - Use full zoom scale
		const targetScale = dpr * zoom; // This will render at full zoom detail

		baseCanvas.width = Math.floor(pageWidth * targetScale);
		baseCanvas.height = Math.floor(pageHeight * targetScale);
		baseCanvas.style.position = "absolute";
		baseCanvas.style.top = "0";
		baseCanvas.style.left = "0";
		baseCanvas.style.width = `${pageWidth}px`;
		baseCanvas.style.height = `${pageHeight}px`;
		baseCanvas.style.transform = "translate(0px, 0px)";
		baseCanvas.style.zIndex = "0";
		baseCanvas.style.pointerEvents = "none";

		const context = baseCanvas.getContext("2d");
		if (!context) {
			return;
		}

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, baseCanvas.width, baseCanvas.height);

		const viewport = pdfPageProxy.getViewport({ scale: targetScale });

		const renderingTask = pdfPageProxy.render({
			canvasContext: context,
			viewport,
			background,
		});

		renderingTask.promise.catch((error) => {
			if (error.name === "RenderingCancelledException") {
				return;
			}

			throw error;
		});

		return () => {
			void renderingTask.cancel();
		};
	}, [pdfPageProxy, background, dpr, zoom]);

	return {
		canvasRef,
	};
};
