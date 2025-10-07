// Simplified CanvasLayer - No detail canvas needed
import { memo, type HTMLProps } from "react";
import { useCanvasLayer } from "../../hooks/layers/useCanvasLayer";

export const CanvasLayer = memo(({
	style,
	background,
	...props
}: HTMLProps<HTMLCanvasElement> & {
	background?: string;
}) => {
	const { canvasRef } = useCanvasLayer({ background });
	
	return <canvas {...props} ref={canvasRef} style={style} />;
});