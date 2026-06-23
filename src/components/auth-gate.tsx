import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useWorkspaceStore } from "@/hooks/use-workspace-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, KeyRound, Building2, User, Mail, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, profile, loading, createCompany, joinCompany } = useWorkspaceStore();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Chief Operating Officer");
  const [orgName, setOrgName] = useState("");
  const [orgIdToJoin, setOrgIdToJoin] = useState("");
  const [isCreatingOrg, setIsCreatingOrg] = useState(true); // Toggle between create or join org
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (isSignUp) {
        if (!name) {
          toast.error("Please enter your name");
          setAuthLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
            },
          },
        });
        if (error) throw error;
        toast.success("Registration successful! Check your email or try logging in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOrgSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (isCreatingOrg) {
        if (!orgName) {
          toast.error("Please enter an organization name");
          setAuthLoading(false);
          return;
        }
        await createCompany(orgName);
        toast.success(`Organization "${orgName}" created and seeded!`);
      } else {
        if (!orgIdToJoin) {
          toast.error("Please enter an organization ID");
          setAuthLoading(false);
          return;
        }
        await joinCompany(orgIdToJoin);
        toast.success("Joined organization successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to set up organization");
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading secure workspace...</p>
        </div>
      </div>
    );
  }

  // Case 1: Not logged in
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <Card className="w-full max-w-md border-border/40 shadow-xl backdrop-blur-md bg-background/95">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isSignUp ? "Create your account" : "PB39 Portal"}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Sign up to track strategic company goals and execution" 
                : "Sign in to access your personal board dashboard"
              }
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="reg-name"
                        placeholder="e.g. Alex Kim"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-role">Role / Job Title</Label>
                    <div className="relative">
                      <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="reg-role"
                        placeholder="e.g. Chief Operating Officer"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="auth-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full cursor-pointer" disabled={authLoading}>
                {authLoading ? "Processing..." : isSignUp ? "Register" : "Sign In"}
              </Button>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account yet? Sign Up"}
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Case 2: Logged in, but company linking is in progress (Bypasses setup screen)
  if (session && (!profile || !profile.company_id)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  // Case 3: Fully authenticated with active company
  return <>{children}</>;
}
