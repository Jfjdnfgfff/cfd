import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import Footer from "@/components/Footer";
import StorePage from "@/pages/StorePage";
import AdminPage from "@/pages/AdminPage";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]" dir="rtl">
      <div className="text-center">
        <h1 className="text-6xl font-black text-yellow-400 mb-4">404</h1>
        <p className="text-gray-400 text-lg">الصفحة غير موجودة</p>
        <a href="/" className="mt-6 inline-block btn-gold px-6 py-2 rounded-xl text-sm">
          العودة للرئيسية
        </a>
      </div>
    </div>
  );
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        {/* Admin page — no navbar/footer */}
        <Route path="/admin">
          <AdminPage />
        </Route>

        {/* Store */}
        <Route path="/">
          <>
            <Navbar onCartOpen={() => setCartOpen(true)} />
            <CartSidebar
              isOpen={cartOpen}
              onClose={() => setCartOpen(false)}
            />
            <StorePage onCartOpen={() => setCartOpen(true)} />
            <Footer />
          </>
        </Route>

        <Route>
          <NotFound />
        </Route>
      </Switch>
    </WouterRouter>
  );
}

export default App;
