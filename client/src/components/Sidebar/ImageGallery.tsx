import React, { useState, useEffect } from "react";
import { createClient, Photo } from "pexels";
import "../../styles/sidebar.scss";

const apikey = process.env.REACT_APP_PEXELS_API_KEY; // Use the Pexels API key
const client = createClient(apikey || "");  // Pass the API key to the client

const ImageGallery = ({ onSelect }: { onSelect: (url: string) => void }) => {
  const [images, setImages] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  console.log("Pexels API Key:", apikey);

  const fetchImages = async (query: string, pageNum: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.photos.search({ 
        query: query || "nature", 
        per_page: 12,
        page: pageNum
      });
      if (res && "photos" in res && res.photos) {
        if (pageNum === 1) {
          setImages(res.photos);
        } else {
          setImages(prev => [...prev, ...res.photos]);
        }
      } else {
        setError("No photos found");
      }
    } catch (error) {
      setError("Error fetching images from Pexels");
      console.error("Error fetching images from Pexels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchImages(searchQuery);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchImages(searchQuery, nextPage);
  };

  return (
    <div className="image-gallery">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for images..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {loading && <p>Loading...</p>}
      
      <div className="grid">
        {images.map((img) => (
          <div key={img.id} className="image-container">
            <img
              src={img.src.medium}
              alt={img.alt || "No description available"}
              onClick={() => onSelect(img.src.medium)}
              className="gallery-image"
            />
          </div>
        ))}
      </div>

      {images.length > 0 && (
        <button 
          onClick={handleLoadMore} 
          className="load-more-button"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default ImageGallery;
