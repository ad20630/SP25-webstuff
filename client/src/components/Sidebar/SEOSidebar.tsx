//thea
import React, { useState } from 'react';
import { useEditor } from 'state/editor/EditorReducer';
import { ActionType } from 'state/editor/EditorReducer';
import 'styles/seo-sidebar.scss';

type Props = {}

const SEOSidebar = (props: Props) => {
  const { state: editorState, dispatch } = useEditor();
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

  const handleInputChange = (field: string, value: string) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update the editor state with SEO metadata
    dispatch({
      type: ActionType.ATTRIBUTE_CHANGED,
      target: "attributes",
      attribute: `seo-${field}`,
      newValue: value
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
          />
        </div>

        <div className="seo-field">
          <label title={tooltips.description}>Meta Description <span className="tooltip-icon">?</span></label>
          <textarea
            value={seoData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter meta description"
            rows={3}
          />
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
          />
        </div>

        <div className="seo-field">
          <label title={tooltips.ogDescription}>OG Description <span className="tooltip-icon">?</span></label>
          <textarea
            value={seoData.ogDescription}
            onChange={(e) => handleInputChange('ogDescription', e.target.value)}
            placeholder="Enter Open Graph description"
            rows={3}
          />
        </div>

        <div className="seo-field">
          <label title={tooltips.ogImage}>OG Image URL <span className="tooltip-icon">?</span></label>
          <input
            type="text"
            value={seoData.ogImage}
            onChange={(e) => handleInputChange('ogImage', e.target.value)}
            placeholder="Enter Open Graph image URL"
          />
        </div>
      </div>
    </aside>
  );
}

export default SEOSidebar;
