import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
//import NavBar from "./components/NavBar.tsx";
import 'bootstrap/dist/css/bootstrap.min.css'
import CourseProvider from "./contexts/CourseContext.tsx";


function App() {
    return (
        <CourseProvider>
            {/* <NavBar /> */}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </main>
        </CourseProvider>
    );
}

export default App;
