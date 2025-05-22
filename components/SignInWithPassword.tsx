// /home/louisxiv/free_store/components/SignInWithPassword.tsx
"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { ConvexError } from "convex/values";
import { Loader2 } from "lucide-react";

export function SignInWithPassword({
  provider,
  handleSent,
  handlePasswordReset,
  customSignUp,
  passwordRequirements = "Le mot de passe doit être d'au moins 8 caractères.",
}: {
  provider?: string;
  handleSent?: (email: string) => void;
  handlePasswordReset?: () => void;
  customSignUp?: React.ReactNode;
  passwordRequirements?: string;
}) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get("email") as string;
    
    try {
      await signIn(provider ?? "password", formData);
      handleSent?.(emailValue);
    } catch (error) {
      console.error(error);
      let toastTitle: string;
      let toastDescription: string | undefined;
      
      if (error instanceof ConvexError && error.data === "INVALID_PASSWORD") {
        toastTitle = "Erreur d'authentification";
        toastDescription = "Mot de passe invalide - veuillez vérifier les exigences et réessayer.";
      } else {
        toastTitle = flow === "signIn" ? "Échec de la connexion" : "Échec de l'inscription";
        toastDescription = flow === "signIn" 
          ? "Impossible de se connecter avec ces identifiants. Avez-vous besoin d'un compte ?" 
          : "Impossible de créer votre compte. Déjà inscrit ?";
      }
      
      toast({ 
        title: toastTitle,
        description: toastDescription, 
        variant: "destructive" 
      });
      setSubmitting(false);
    }
  };

  const toggleFlow = () => setFlow(flow === "signIn" ? "signUp" : "signIn");

  return (
    <form className="flex flex-col space-y-4 bg-white p-10 rounded-xl" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Adresse e-mail
        </label>
        <Input 
          name="email" 
          id="email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@example.com"
          autoComplete="email"
          required
          className="focus:ring-2 focus:ring-offset-1"
        />
      </div>
      
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Mot de passe
          </label>
          {handlePasswordReset && flow === "signIn" && (
            <Button
              type="button"
              variant="link"
              onClick={handlePasswordReset}
              className="p-0 h-auto text-xs text-blue-600 hover:text-blue-800"
            >
              Mot de passe oublié ?
            </Button>
          )}
        </div>
        <Input
          type="password"
          name="password"
          id="password"
          placeholder={flow === "signUp" ? "Créer un mot de passe" : "Entrer votre mot de passe"}
          autoComplete={flow === "signIn" ? "current-password" : "new-password"}
          required
          className="focus:ring-2 focus:ring-offset-1"
        />
        {flow === "signUp" && passwordRequirements && (
          <p className="text-xs text-gray-500 mt-1">
            {passwordRequirements}
          </p>
        )}
      </div>

      {flow === "signUp" && customSignUp}
      <input name="flow" value={flow} type="hidden" />
      
      <div className="pt-2">
        <Button 
          type="submit" 
          disabled={submitting} 
          className="w-full font-medium"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {flow === "signIn" ? "Connexion en cours..." : "Création du compte en cours..."}
            </>
          ) : (
            flow === "signIn" ? "Se connecter" : "Créer un compte"
          )}
        </Button>
      </div>
      
      <div className="text-center">
        <Button
          variant="link"
          type="button"
          onClick={toggleFlow}
          className="text-sm"
        >
          {flow === "signIn"
            ? "N'avez-vous pas de compte ? Inscrivez-vous"
            : "Avez-vous déjà un compte ? Se connecter"}
        </Button>
      </div>
    </form>
  );
}