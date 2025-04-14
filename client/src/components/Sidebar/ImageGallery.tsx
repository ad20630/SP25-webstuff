import React, { useState, useEffect, useRef } from "react";
import { createClient, Photo } from "pexels";
import "../../styles/sidebar.scss";
import { useDraggable } from "state/dragAndDrop/hooks/useDraggable";

const apikey = process.env.REACT_APP_PEXELS_API_KEY; // Use the Pexels API key
const client = createClient(apikey || "");  // Pass the API key to the client

interface DraggableImageProps {
  img: Photo | { src: { medium: string }, alt: string };
  onSelect: (url: string) => void;
}

const DraggableImage: React.FC<DraggableImageProps> = ({ img, onSelect }) => {
  const { dragRef, startDrag } = useDraggable({
    type: "image",
    url: img.src.medium,
    alt: img.alt || "No description available"
  });

  return (
    <div className="image-container">
      <img
        src={img.src.medium}
        alt={img.alt || "No description available"}
        onClick={() => onSelect(img.src.medium)}
        onMouseDown={startDrag}
        ref={dragRef as React.RefObject<HTMLImageElement>}
        className="gallery-image"
        style={{ cursor: "grab" }}
      />
    </div>
  );
};

const ImageGallery = ({ onSelect }: { onSelect: (url: string) => void }) => {
  const [pexelsImages, setPexelsImages] = useState<Photo[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{ src: { medium: string }, alt: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log("Pexels API Key:", apikey);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newImage = {
          src: { medium: dataUrl },
          alt: file.name
        };
        setUploadedImages(prev => [newImage, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

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
          setPexelsImages(res.photos);
        } else {
          setPexelsImages(prev => [...prev, ...res.photos]);
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
      {/* Uploaded Images Section */}
      <div className="gallery-section">
        <h3>Your Uploaded Images</h3>
        <div className="upload-section">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button 
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image
          </button>
        </div>
        <div className="grid">
          {uploadedImages.map((img, index) => (
            <DraggableImage key={`uploaded-${index}`} img={img} onSelect={onSelect} />
          ))}
        </div>
      </div>

      {/* Pexels Images Section */}
      <div className="gallery-section">
        <h3>Pexels Image Gallery</h3>
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
          {pexelsImages.map((img) => (
            <DraggableImage key={img.id} img={img} onSelect={onSelect} />
          ))}
        </div>

        {pexelsImages.length > 0 && (
          <button 
            onClick={handleLoadMore} 
            className="load-more-button"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
