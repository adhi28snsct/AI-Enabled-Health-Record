import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Mail, Lock, LogIn, ShieldCheck, User } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, getDashboardPath } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= REDIRECT IF ALREADY LOGGED IN ================= */
  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDashboardPath(), { replace: true });
    }
  }, [isAuthenticated, navigate, getDashboardPath]);

  /* ================= PATIENT LOGIN ================= */
  const handlePatientLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      login(data); // 🔥 AuthContext handles everything
      navigate(getDashboardPath(), { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async (res) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/google-login",
        { idToken: res.credential }
      );

      login(data);
      navigate(getDashboardPath(), { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Access not allowed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-[450px] border-none shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription>
            Choose your login method to access HealthConnect
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="staff">Staff / Admin</TabsTrigger>
            </TabsList>

            {/* ================= PATIENT LOGIN ================= */}
            <TabsContent value="patient">
              <form onSubmit={handlePatientLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Password</Label>
                    <Link
                      to="#"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : (
                    <>
                      Sign In <LogIn className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* ================= STAFF / GOOGLE LOGIN ================= */}
            <TabsContent value="staff" className="text-center space-y-6">
              <div className="bg-muted/50 p-6 rounded-lg border border-dashed">
                <User className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Internal Access Only</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Doctors and admins must use verified accounts
                </p>

                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => alert("Google login failed")}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="border-t pt-6">
          <p className="text-sm text-center text-muted-foreground w-full">
            Don&apos;t have a patient account?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}