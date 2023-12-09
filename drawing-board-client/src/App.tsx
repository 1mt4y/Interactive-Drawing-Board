import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Room from "./Room";
import { generate as generateUUID } from "short-uuid";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={generateUUID()} />} />
          <Route path="/:roomId" element={<Room />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
