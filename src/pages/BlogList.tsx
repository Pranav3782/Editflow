import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blogPosts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BlogList = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
            <SEOHead
                title="Blog - EditFlow"
                description="Latest insights on video editing workflows, productivity, and team management."
            />

            {/* Header */}
            <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity group">
                        <img src="/logo.png" alt="EditFlow logo" className="h-8 w-auto object-contain flex-shrink-0 rounded-xl group-hover:scale-105 transition-transform" />
                        EditFlow
                    </Link>
                    <Button variant="ghost" asChild className="hover:bg-primary/5 transition-colors">
                        <Link to="/">Back to Home</Link>
                    </Button>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-16 relative overflow-hidden">
                {/* Decorative background element - constrained to top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-primary/5 blur-3xl -z-10 rounded-full opacity-50 pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        The EditFlow Blog
                    </span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
                        Master Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Workflow</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Expert insights, actionable strategies, and industry trends to help your video production team ship faster.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Card key={post.slug} className="group flex flex-col h-full overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-card">
                            {/* Make Image Clickable */}
                            <Link to={`/blog/${post.slug}`} className="block aspect-video w-full overflow-hidden bg-muted relative cursor-pointer">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Link>

                            <CardHeader className="space-y-3 pb-3">
                                <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                    <Link to={`/blog/${post.slug}`}>
                                        {post.title}
                                    </Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription className="text-base line-clamp-3 leading-relaxed">
                                    {post.description}
                                </CardDescription>
                            </CardContent>
                            <CardFooter className="pt-4 pb-6">
                                {/* Direct Link using buttonVariants for absolute reliability */}
                                <Link
                                    to={`/blog/${post.slug}`}
                                    className={cn(buttonVariants({ variant: "default" }), "w-full group/btn shadow-lg shadow-primary/20 transition-all duration-300")}
                                >
                                    Read Article
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Newsletter / CTA Section at bottom */}
                <div className="mt-24 rounded-2xl bg-gray-900 border border-gray-800 p-8 md:p-12 text-center text-white relative overflow-hidden isolate">
                    {/* Fixed background to avoid whitish bleed */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-900 to-gray-800" />
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary/20 blur-3xl rounded-full opacity-50 pointer-events-none" />

                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <h2 className="text-3xl font-bold">Ready to implement these strategies?</h2>
                        <p className="text-gray-300 text-lg">
                            Join thousands of video teams efficiently managing their post-production pipeline with EditFlow.
                        </p>
                        <Link
                            to="/planner"
                            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "font-bold hover:scale-105 transition-transform bg-white text-gray-900 hover:bg-gray-100")}
                        >
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BlogList;
