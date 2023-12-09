import { useParams } from "react-router-dom";
import "./styles.css";
import { useRef, useState, useCallback, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:10000");

function Room() {
  const { roomId } = useParams();
  const [socketConnected, setSocketConnected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("brush");

  // initialize socket
  useEffect(() => {
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("draw", (newState) => setCanvasState(newState));

    function onConnect() {
      setSocketConnected(true);
      socket.emit("join-room", roomId);
    }

    function onDisconnect() {
      setSocketConnected(false);
      console.log("socket disconnected");
    }
  }, []);

  // initialize some canvas properties
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
      }
    }
  }, [brushSize]);

  const broadcastCurrentState = () => {
    if (!socketConnected || !canvasRef.current) return;
    const newState = canvasRef.current.toDataURL();
    socket.emit("draw", newState);
  };

  const setCanvasState = (state: string) => {
    // state can be null if we are the first to connect to the room
    if (state) {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.src = state;
      img.onload = function () {
        ctx.clearRect(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        );
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      const ctx = e.currentTarget.getContext("2d");
      if (!ctx) return;

      switch (tool) {
        case "brush":
          ctx.strokeStyle = color;
          break;
        case "eraser":
          ctx.strokeStyle = "#ffffff"; // simply set color to white for erasing
          break;
        default:
          break;
      }

      ctx.lineTo(
        e.clientX - canvasRef.current!.offsetLeft,
        e.clientY - canvasRef.current!.offsetTop
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(
        e.clientX - canvasRef.current!.offsetLeft,
        e.clientY - canvasRef.current!.offsetTop
      );
    },
    [tool, color]
  );

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx)
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    broadcastCurrentState();
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    setDrawing(true);
    draw(e); // start drawing or erasing immediately at the clicked point
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (drawing) {
      draw(e);
      // NOTE: this updates the state on every mouseMove event
      // which uses way more bandwidth and will be laggy sometimes
      // a better way to do it is maybe updating every 500ms or so?
      // broadcastCurrentState();
    }
  };

  const handleMouseUp = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    draw(e); // to draw dots in case cursor hasn't moved
    setDrawing(false);

    // end of current path (start a new path)
    e.currentTarget.getContext("2d")?.beginPath();

    broadcastCurrentState();
  };

  return (
    <>
      <input
        type="color"
        id="colorPicker"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <input
        type="range"
        id="brushSize"
        min="1"
        max="50"
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
      />
      <button onClick={clearCanvas}>Clear</button>
      <button onClick={() => setTool("brush")}>Brush</button>
      <button onClick={() => setTool("eraser")}>Eraser</button>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        width="800"
        height="600"
      ></canvas>
    </>
  );
}

export default Room;
