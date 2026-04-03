import { Routes, Route } from 'react-router-dom';
import Navbar         from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage         from './pages/HomePage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import ProfilePage      from './pages/ProfilePage';
import RecipesPage      from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import AddRecipePage    from './pages/AddRecipePage';
import ArticlesPage     from './pages/ArticlesPage';
import DietPlannerPage  from './pages/DietPlannerPage';
import MealLogPage      from './pages/MealLogPage';
import ShoppingListPage from './pages/ShoppingListPage';
import ChatbotPage      from './pages/ChatbotPage';
import AdminPage        from './pages/AdminPage';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/recipes"  element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/articles" element={<ArticlesPage />} />

          {/* Private */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/recipes/add" element={<ProtectedRoute><AddRecipePage /></ProtectedRoute>} />
          <Route path="/planner"   element={<ProtectedRoute><DietPlannerPage /></ProtectedRoute>} />
          <Route path="/meals"     element={<ProtectedRoute><MealLogPage /></ProtectedRoute>} />
          <Route path="/shopping"  element={<ProtectedRoute><ShoppingListPage /></ProtectedRoute>} />
          <Route path="/chatbot"   element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
          <Route path="/admin"     element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
