import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, ArrowRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hostelRoomNumber, setHostelRoomNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [wardenId, setWardenId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [adminAccessCode, setAdminAccessCode] = useState("");
  const [role, setRole] = useState("student");
  const [authError, setAuthError] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, loginWithGoogle, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email && password) {
      setAuthError("");
      setIsEmailLoading(true);
      try {
        await login(email, password);
        navigate("/dashboard");
      } catch {
        setAuthError(
          "Unable to sign in. Please check credentials and Firebase setup.",
        );
      } finally {
        setIsEmailLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Google sign-in failed. Please try again.",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAuthError("Password and confirm password must match.");
      return;
    }

    setAuthError("");
    setIsEmailLoading(true);
    try {
      await signUpWithEmail(
        {
          fullName: role === "student" ? fullName : fullName,
          email,
          hostelRoomNumber: role === "student" ? hostelRoomNumber : undefined,
          studentId: role === "student" ? studentId : undefined,
          wardenId: role === "warden" ? wardenId : undefined,
          phoneNumber: phoneNumber,
          department: role === "warden" ? department : undefined,
          role,
        },
        password,
      );
      navigate("/dashboard");
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Could not create account. Check details and Firebase configuration.",
      );
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-zinc-950 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">HostelHub</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Smart Hostel Management System
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Streamlining hostel operations, from automated leave approvals to
              instant complaint resolution. Experience transparent and
              hassle-free hostel life.
            </p>
          </motion.div>

          <div className="mt-12 flex items-center gap-4 text-sm font-medium text-zinc-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt="user"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <span>Trusted by 500+ students</span>
          </div>
        </div>

        <div className="relative z-10 text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} HostelHub Inc.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-zinc-200/50 [mask-image:linear-gradient(to_bottom,white,transparent)] dark:bg-grid-zinc-800/50 pointer-events-none" />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                HostelHub
              </span>
            </div>
          </div>

          <Card className="border-border/50 shadow-xl shadow-zinc-200/50 dark:shadow-none backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold">
                {mode === "signin" ? "Welcome back" : "Create account"}
              </CardTitle>
              <CardDescription>
                {mode === "signin"
                  ? "Enter your credentials to access your account"
                  : "Create account using email/password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mode === "signin" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 bg-muted/30 focus-visible:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 bg-muted/30 focus-visible:ring-primary/50 transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium group"
                    disabled={!email || !password || isEmailLoading}
                  >
                    {isEmailLoading ? "Signing in..." : "Sign in"}
                    {!isEmailLoading && (
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 text-base font-medium"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading
                      ? "Connecting to Google..."
                      : "Sign in with Google"}
                  </Button>
                  {authError && (
                    <p className="text-sm text-destructive">{authError}</p>
                  )}
                </form>
              ) : (
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <Tabs
                    defaultValue="student"
                    className="w-full"
                    onValueChange={(v) => setRole(v)}
                  >
                    <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50">
                      <TabsTrigger
                        value="student"
                        className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Student
                      </TabsTrigger>
                      <TabsTrigger
                        value="warden"
                        className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Warden
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {role === "student" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Username / Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="h-11 bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signupEmail">Email</Label>
                        <Input
                          id="signupEmail"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signupPassword">Password</Label>
                        <Input
                          id="signupPassword"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11 bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="h-11 bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hostelRoomNumber">
                          Hostel Room Number
                        </Label>
                        <Input
                          id="hostelRoomNumber"
                          value={hostelRoomNumber}
                          onChange={(e) => setHostelRoomNumber(e.target.value)}
                          required
                          className="h-11 bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          required
                          className="h-11 bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                          className="h-11 bg-muted/30"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-medium"
                        disabled={isEmailLoading}
                      >
                        {isEmailLoading
                          ? "Creating account..."
                          : "Create account"}
                      </Button>
                    </>
                  )}

                  {role === "warden" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="wardenId">
                          Employee ID / Warden ID
                        </Label>
                        <Input
                          id="wardenId"
                          value={wardenId}
                          onChange={(e) => setWardenId(e.target.value)}
                          required
                          className="h-11 bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wardenEmail">Email</Label>
                        <Input
                          id="wardenEmail"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wardenPassword">Password</Label>
                        <Input
                          id="wardenPassword"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11 bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wardenConfirmPassword">
                          Confirm Password
                        </Label>
                        <Input
                          id="wardenConfirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="h-11 bg-muted/30"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-11 text-base font-medium"
                        disabled={isEmailLoading}
                      >
                        {isEmailLoading
                          ? "Creating account..."
                          : "Create account"}
                      </Button>
                    </>
                  )}
                  {authError && (
                    <p className="text-sm text-destructive">{authError}</p>
                  )}
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground border-t p-6">
              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setMode(mode === "signin" ? "signup" : "signin");
                }}
                className="font-semibold text-primary ml-1 hover:underline"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
