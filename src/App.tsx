import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Sidebar from "@/components/Sidebar"
import TrainingField from "@/pages/TrainingField"
import Review from "@/pages/Review"
import QuestionBank from "@/pages/QuestionBank"

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#0f0f1a]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<TrainingField />} />
            <Route path="/review" element={<Review />} />
            <Route path="/bank" element={<QuestionBank />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
