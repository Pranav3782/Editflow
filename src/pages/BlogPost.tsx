import { useParams, Link, Navigate } from "react-router-dom";
import { blogPosts, BlogPost } from "@/data/blogPosts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { ArrowLeft } from "lucide-react";

const BlogPostPage = () => {
    const { slug } = useParams<{ slug: string }>();

    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return <Navigate to="/blog" replace />; // Or 404 page
    }

    const relatedPosts = post.relatedPosts
        .map((relatedSlug) => blogPosts.find((p) => p.slug === relatedSlug))
        .filter((p): p is BlogPost => p !== undefined);

    // Fallback if related posts aren't explicitly defined/found, just take first 3 that aren't this one
    const displayRelated = relatedPosts.length > 0
        ? relatedPosts
        : blogPosts.filter(p => p.slug !== post.slug).slice(0, 3);

    // Create schema for FAQ
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": post.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEOHead
                title={`${post.title} - EditFlow Blog`}
                description={post.description}
                schema={faqSchema}
            />
            {/* Minimal Header for Blog Post */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/blog" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="EditFlow logo" className="h-8 w-auto object-contain flex-shrink-0 rounded-xl" />
                        EditFlow Blog
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                            <Link to="/blog">All Articles</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/">Back to Home</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
                <Button variant="ghost" asChild className="mb-6 pl-0 hover:pl-2 transition-all">
                    <Link to="/blog" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Blog
                    </Link>
                </Button>

                <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground">{post.title}</h1>

                    <div className="relative aspect-video w-full mb-8 overflow-hidden rounded-xl shadow-lg">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="object-cover w-full h-full"
                        />
                    </div>

                    <div
                        className="text-foreground/90 space-y-6"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>

                {/* FAQ Section */}
                <section className="mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        {post.faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </section>

                {/* Hub / Related Posts */}
                <section className="border-t pt-12">
                    <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {displayRelated.map((related) => (
                            <Card key={related.slug} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                                    <img
                                        src={related.image}
                                        alt={related.title}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg line-clamp-2 leading-tight">
                                        <Link to={`/blog/${related.slug}`} className="hover:text-primary transition-colors">
                                            {related.title}
                                        </Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="hidden sm:block">
                                    <CardDescription className="line-clamp-2">
                                        {related.description}
                                    </CardDescription>
                                </CardContent>
                                <CardFooter className="mt-auto">
                                    <Button variant="link" asChild className="p-0 h-auto font-semibold">
                                        <Link to={`/blog/${related.slug}`}>Read Now</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPostPage;
