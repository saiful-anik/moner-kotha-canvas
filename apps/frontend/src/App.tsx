import { Route, Routes } from "react-router-dom";
import { Canvas } from "./routes/index";

export function App() { return <Routes><Route path="*" element={<Canvas />} /></Routes>; }
