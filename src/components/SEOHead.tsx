import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    noIndex?: boolean;
    schema?: Record<string, any>;
    keywords?: string;
    breadcrumbs?: { name: string; item: string }[];
}

const DEFAULT_TITLE = "EditFlow – Plan Editor Work Without Chaos";
const DEFAULT_DESC = "EditFlow helps creative agencies plan editor workloads, avoid overload, and schedule work effortlessly.";
const SITE_URL = "https://www.editorflow.com"; // Placeholder
const DEFAULT_IMAGE = "https://www.editorflow.com/og-image.jpg"; // Placeholder

export const SEOHead = ({
    title = DEFAULT_TITLE,
    description = DEFAULT_DESC,
    image = DEFAULT_IMAGE,
    url = SITE_URL,
    type = 'website',
    noIndex = false,
    schema,
    keywords,
    breadcrumbs
}: SEOHeadProps) => {

    const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
    const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

    return (
        <Helmet>
            {/* Basic Metadata */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={fullUrl} />
            <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />

            {/* OpenGraph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content="EditFlow" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />

            {/* Structured Data (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}

            {/* Breadcrumb Schema */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": breadcrumbs.map((crumb, index) => ({
                            "@type": "ListItem",
                            "position": index + 1,
                            "name": crumb.name,
                            "item": crumb.item.startsWith('http') ? crumb.item : `${SITE_URL}${crumb.item}`
                        }))
                    })}
                </script>
            )}

            {/* Default Organization Schema */}
            {!noIndex && (
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "EditFlow",
                        "url": SITE_URL,
                        "logo": `${SITE_URL}/logo.png`,
                        "sameAs": [
                            "https://twitter.com/editorflow",
                            "https://linkedin.com/company/editorflow",
                            "https://github.com/transitive-bullshit/editor-flow-planner"
                        ]
                    })}
                </script>
            )}
        </Helmet>
    );
};
