import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navigation from "./components/Navigation.tsx";
import RecipeCategories from "./pages/RecipeCategories.tsx";
import RecipeList from "./pages/RecipeList.tsx";
import RecipeDetails from "./pages/RecipeDetails.tsx";
import Sidebar from "./components/Sidebar.tsx";
import RecipeTable from "./pages/RecipeTable.tsx";
import { useState } from "react";
import HomeContent from "./pages/Home.tsx";

function App() {
  const [passedRecipe, setPassedRecipe] = useState<any>(null);
  const [processCart, setProcessCart] = useState<Boolean>(false);

  const handleAddCart = (recipeName: any) => {
    setPassedRecipe(recipeName); // Update state when data is passed from RecipeList
  };

  const handleProcessCart = () => {
    setProcessCart(!processCart);
  };

  return (
    <Router>
      <div className="row">
        <div className="col-auto">
          <div className="app">
            <div style={{ maxWidth: "400px", margin: "0 auto" }}>
              <Navigation />
            </div>
            <div className="content">
              <Routes>
                <Route path="/" element={<HomeContent />} />
                <Route path="/categories" element={<RecipeCategories />} />
                <Route
                  path="/categories/:category"
                  element={<RecipeList onRecipeUpdate={handleAddCart} />}
                />
                <Route
                  path="/recipe/:recipe_name"
                  element={<RecipeDetails />}
                />
                <Route
                  path="recipes"
                  element={
                    <RecipeTable
                      onRecipeUpdate={handleAddCart}
                      processCartFlag={processCart}
                    />
                  }
                />
              </Routes>
            </div>
          </div>
        </div>
        <div className="col">
          <Sidebar
            recipeName={passedRecipe}
            onProcessRecipes={handleProcessCart}
          />
        </div>
      </div>
    </Router>
  );
}

export default App;
