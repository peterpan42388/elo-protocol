import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AgentsWalletPage } from "./pages/AgentsWalletPage";
import { MarketPage } from "./pages/MarketPage";
import { OverviewPage } from "./pages/OverviewPage";
import { ReviewsOutcomesPage } from "./pages/ReviewsOutcomesPage";

export function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/reviews" element={<ReviewsOutcomesPage />} />
        <Route path="/agents" element={<AgentsWalletPage />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </AppLayout>
  );
}
