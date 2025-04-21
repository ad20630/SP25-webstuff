//thea
import React, { useState, useEffect } from 'react';
import { useEditor } from 'state/editor/EditorReducer';
import { ActionType } from 'state/editor/EditorReducer';
import { usePages } from 'state/pages/PagesContext';
import 'styles/seo-sidebar.scss';

type Props = {}

const SEOSidebar = (props: Props) => {
  const { state: editorState, dispatch } = useEditor();
  const { currentPage } = usePages();
  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonicalUrl: '',
    index: 'index',
    follow: 'follow'
  });

  // Load saved SEO data when page changes
  useEffect(() => {
    if (currentPage !== null) {
      const savedSeoData = localStorage.getItem(`seo-${currentPage}`);
      if (savedSeoData) {
        setSeoData(JSON.parse(savedSeoData));
      }
    }
  }, [currentPage]);

  // Save SEO data when it changes
  useEffect(() => {
    if (currentPage !== null) {
      localStorage.setItem(`seo-${currentPage}`, JSON.stringify(seoData));
    }
  }, [seoData, currentPage]);

  const handleInputChange = (field: string, value: string) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update the editor state with SEO metadata without triggering parseId
    dispatch({
      type: ActionType.UPDATE_SEO_METADATA,
      metadata: {
        ...seoData,
        [field]: value
      }
    });
  };

  const tooltips = {
    title: "The main title of your webpage that appears in browser tabs and search results. Keep it under 60 characters.",
    description: "A brief summary of your page's content that appears in search results. Aim for 150-160 characters.",
    keywords: "Comma-separated words that describe your page's content. Helps search engines understand your page's topic.",
    canonicalUrl: "The preferred URL for this page if it can be accessed through multiple URLs. Helps prevent duplicate content issues.",
    ogTitle: "The title that appears when your page is shared on social media platforms like Facebook or Twitter.",
    ogDescription: "The description that appears when your page is shared on social media platforms.",
    ogImage: "The image that appears when your page is shared on social media platforms. Use a high-quality image (1200x630px recommended).",
    index: "Controls whether search engines should index this page. 'index' allows indexing, 'noindex' prevents it.",
    follow: "Controls whether search engines should follow links on this page. 'follow' allows following links, 'nofollow' prevents it."
  };

  const getCharacterCountClass = (text: string, max: number) => {
    const length = text.length;
    if (length > max) return 'character-count-error';
    if (length > max * 0.9) return 'character-count-warning';
    return 'character-count-ok';
  };

  const generateHeadHtml = () => {
    return `
      <head>
        <title>${seoData.title}</title>
        <meta name="description" content="${seoData.description}" />
        <meta name="keywords" content="${seoData.keywords}" />
        <meta name="robots" content="${seoData.index},${seoData.follow}" />
        ${seoData.canonicalUrl ? `<link rel="canonical" href="${seoData.canonicalUrl}" />` : ''}
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website" />
        <meta property="og:title" content="${seoData.ogTitle || seoData.title}" />
        <meta property="og:description" content="${seoData.ogDescription || seoData.description}" />
        ${seoData.ogImage ? `<meta property="og:image" content="${seoData.ogImage}" />` : ''}
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${seoData.ogTitle || seoData.title}" />
        <meta name="twitter:description" content="${seoData.ogDescription || seoData.description}" />
        ${seoData.ogImage ? `<meta name="twitter:image" content="${seoData.ogImage}" />` : ''}
      </head>
    `;
  };

  return (
    <aside className='style-sidebar'>
      <header className='sidebar-header'>
        <h2>SEO</h2>
        <p className="seo-intro">Search Engine Optimization (SEO) helps your website appear in search results. Fill in these fields to improve your site's visibility.</p>
      </header>
      
      <div className="seo-section">
        <h3>Basic SEO</h3>
        <div className="seo-field">
          <label title={tooltips.title}>Page Title <span className="tooltip-icon">?</span></label>
          <input
            type="text"
            value={seoData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter page title"
            className={getCharacterCountClass(seoData.title, 60)}
          />
          <div className="character-count">
            {seoData.title.length}/60 characters
          </div>
        </div>

        <div className="seo-field">
          <label title={tooltips.description}>Meta Description <span className="tooltip-icon">?</span></label>
          <textarea
            value={seoData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter meta description"
            rows={3}
            className={getCharacterCountClass(seoData.description, 160)}
          />
          <div className="character-count">
            {seoData.description.length}/160 characters
          </div>
        </div>

        <div className="seo-field">
          <label title={tooltips.keywords}>Keywords <span className="tooltip-icon">?</span></label>
          <input
            type="text"
            value={seoData.keywords}
            onChange={(e) => handleInputChange('keywords', e.target.value)}
            placeholder="Enter keywords (comma separated)"
          />
        </div>

        <div className="seo-field">
          <label title={tooltips.canonicalUrl}>Canonical URL <span className="tooltip-icon">?</span></label>
          <input
            type="text"
            value={seoData.canonicalUrl}
            onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
            placeholder="Enter canonical URL"
          />
        </div>

        <div className="seo-field">
          <label title={tooltips.index}>Index <span className="tooltip-icon">?</span></label>
          <select
            value={seoData.index}
            onChange={(e) => handleInputChange('index', e.target.value)}
          >
            <option value="index">Index</option>
            <option value="noindex">No Index</option>
          </select>
        </div>

        <div className="seo-field">
          <label title={tooltips.follow}>Follow <span className="tooltip-icon">?</span></label>
          <select
            value={seoData.follow}
            onChange={(e) => handleInputChange('follow', e.target.value)}
          >
            <option value="follow">Follow</option>
            <option value="nofollow">No Follow</option>
          </select>
        </div>
      </div>

      <div className="seo-section">
        <h3>Open Graph (Social Media)</h3>
        <div className="seo-field">
          <label title={tooltips.ogTitle}>OG Title <span className="tooltip-icon">?</span></label>
          <input
            type="text"
            value={seoData.ogTitle}
            onChange={(e) => handleInputChange('ogTitle', e.target.value)}
            placeholder="Enter Open Graph title"
            className={getCharacterCountClass(seoData.ogTitle, 60)}
          />
          <div className="character-count">
            {seoData.ogTitle.length}/60 characters
          </div>
        </div>

        <div className="seo-field">
          <label title={tooltips.ogDescription}>OG Description <span className="tooltip-icon">?</span></label>
          <textarea
            value={seoData.ogDescription}
            onChange={(e) => handleInputChange('ogDescription', e.target.value)}
            placeholder="Enter Open Graph description"
            rows={3}
            className={getCharacterCountClass(seoData.ogDescription, 160)}
          />
          <div className="character-count">
            {seoData.ogDescription.length}/160 characters
          </div>
        </div>

        <div className="seo-field">
          <label title={tooltips.ogImage}>OG Image URL <span className="tooltip-icon">?</span></label>
          <input
            type="text"
            value={seoData.ogImage}
            onChange={(e) => handleInputChange('ogImage', e.target.value)}
            placeholder="Enter Open Graph image URL"
          />
          {seoData.ogImage && (
            <div className="og-image-preview">
              <img src={seoData.ogImage} alt="OG Image Preview" />
            </div>
          )}
        </div>
      </div>

      <div className="seo-section">
        <h3>Search Result Preview</h3>
        <div className="search-preview">
          <div className="search-title">{seoData.title || 'Your page title will appear here'}</div>
          <div className="search-url">{seoData.canonicalUrl || 'example.com/page-url'}</div>
          <div className="search-description">{seoData.description || 'Your meta description will appear here'}</div>
        </div>
      </div>

      <div className="seo-section">
        <h3>HTML Head Preview</h3>
        <div className="html-preview">
          <pre className="html-code">
            {generateHeadHtml()}
          </pre>
        </div>
      </div>
    </aside>
  );
}

export default SEOSidebar;
