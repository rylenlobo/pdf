import { useEffect, useState } from "react";

export const useDpr = () => {
	const [dpr, setDPR] = useState(
  !window ? 1 : window.devicePixelRatio // Remove Math.min clamping
);

	useEffect(() => {
		if (!window) {
			return;
		}

		const handleDPRChange = () => {
			setDPR(window.devicePixelRatio);
		};

		const windowMatch = window.matchMedia(
			`screen and (min-resolution: ${dpr}dppx)`,
		);

		windowMatch.addEventListener("change", handleDPRChange);

		return () => {
			windowMatch.removeEventListener("change", handleDPRChange);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dpr]);

	return dpr;
};
