import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login.tsx';
import RegisterPage from './pages/Registration.tsx';
import CreateEventForm from "./pages/CreateEvent.tsx";
import HomePage from "./pages/Home.tsx";
import Event from "./pages/Event.tsx";
import EventAnalysis from "./pages/EventAnalysis.tsx";
import VerificationForm from "./pages/Verification.tsx";


import ProfilePage from "./pages/Profile.tsx";




import Navbar from "./components/NavBar.tsx";

import './index.css';
function App() {
    return (
        <>
        <Navbar />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registration" element={<RegisterPage />} />
                <Route path="/createEvent" element={<CreateEventForm />} />
                <Route path="/events/:id" element={<Event />} />
                <Route path="/users/:username" element={<ProfilePage />} />
                <Route path="/events/:id/analysis" element={<EventAnalysis />} />
                <Route path="/verification" element={<VerificationForm />} />


            </Routes>
        </>
    );


}

export default App;