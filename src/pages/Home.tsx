import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Globe2, Sparkles, TrendingUp, Users } from "lucide-react";
import { Footer } from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
        <div className="max-w-6xl w-full">
          <div className="text-center space-y-8">
            {/* Logo/Brand */}
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-500 via-white to-green-500 p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <Globe2 className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                  BharatLens
                </span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
                AI-powered platform to explore global geopolitics through India's perspective
              </p>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get clear, insightful responses that help you understand the strategic, economic, 
              and cultural dimensions of international affairs from an Indian viewpoint.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                asChild 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto border-2 border-primary hover:bg-primary/10"
              >
                <Link to="/register">Register</Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
              <div className="p-6 rounded-xl bg-background/60 backdrop-blur-sm border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI technology for nuanced geopolitical analysis
                </p>
              </div>

              <div className="p-6 rounded-xl bg-background/60 backdrop-blur-sm border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Strategic Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Deep dive into economic and strategic dimensions
                </p>
              </div>

              <div className="p-6 rounded-xl bg-background/60 backdrop-blur-sm border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Cultural Context</h3>
                <p className="text-sm text-muted-foreground">
                  Understanding global affairs through Indian values
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
