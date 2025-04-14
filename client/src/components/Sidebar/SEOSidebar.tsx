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
    canonicalUrl: ''
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

  return (
    <aside className='style-sidebar'>
      <header className='sidebar-header'>
        <h2>SEO</h2>
      </header>
      
      <div className="seo-section">
        <h3>Basic SEO</h3>
        <div className="seo-field">
          <label>Page Title</label>
          <input
            type="text"
            value={seoData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter page title"
          />
        </div>

        <div className="seo-field">
          <label>Meta Description</label>
          <textarea
            value={seoData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter meta description"
            rows={3}
          />
        </div>

        <div className="seo-field">
          <label>Keywords</label>
          <input
            type="text"
            value={seoData.keywords}
            onChange={(e) => handleInputChange('keywords', e.target.value)}
            placeholder="Enter keywords (comma separated)"
          />
        </div>

        <div className="seo-field">
          <label>Canonical URL</label>
          <input
            type="text"
            value={seoData.canonicalUrl}
            onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
            placeholder="Enter canonical URL"
          />
        </div>
      </div>

      <div className="seo-section">
        <h3>Open Graph (Social Media)</h3>
        <div className="seo-field">
          <label>OG Title</label>
          <input
            type="text"
            value={seoData.ogTitle}
            onChange={(e) => handleInputChange('ogTitle', e.target.value)}
            placeholder="Enter Open Graph title"
          />
        </div>

        <div className="seo-field">
          <label>OG Description</label>
          <textarea
            value={seoData.ogDescription}
            onChange={(e) => handleInputChange('ogDescription', e.target.value)}
            placeholder="Enter Open Graph description"
            rows={3}
          />
        </div>

        <div className="seo-field">
          <label>OG Image URL</label>
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
