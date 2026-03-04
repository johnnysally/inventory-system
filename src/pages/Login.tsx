import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HardHat, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@capellalodge");
  const [password, setPassword] = useState("capella1234");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    console.clear();
    console.log("🔐 Attempting login with:", email);
    try {
      const success = await login(email, password);
      if (success) {
        console.log("✅ Login successful! Redirecting...");
        toast.success("Welcome back!");
        navigate("/");
      } else {
        const errorMsg = "Invalid credentials - Please check email and password";
        setError(errorMsg);
        console.error("❌ LOGIN FAILED:", errorMsg);
        console.error("❌ Email used:", email);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || "Login failed. Please try again.";
      setError(errorMsg);
      console.error("❌ NETWORK/SERVER ERROR:", errorMsg);
      console.error("Full error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary mb-4">
            <HardHat className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">SawelaCapella</h1>
          <p className="text-sm text-muted-foreground mt-1">Inventory Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="stat-card space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-base">❌ Login Error</p>
                <p className="text-sm mt-1">{error}</p>
                <p className="text-xs mt-2 opacity-75">Check the browser console (F12) for more details</p>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="flex-shrink-0 text-destructive hover:opacity-70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@capellalodge" disabled={isLoading} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Demo: admin@capellalodge (Admin) or mary@buildtrack.co / peter@buildtrack.co (Staff)
          </p>
        </form>
      </div>
    </div>
  );
}
