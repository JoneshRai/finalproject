import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiInstance from '../../utils/axios';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Search = () => {
  const query = useQuery();
  const searchParam = query.get("query");

  const [subject, setSubject] = useState('');
  const [videoLinks, setVideoLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const extractVideoId = (url) => {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const handleRecommendation = async (queryText) => {
    if (!queryText) {
      setErrorMessage('Please provide a topic or description.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const response = await apiInstance.post('http://127.0.0.1:8000/Ai/', {
        topic: queryText,
        description: ''
      });

      const data = response.data;
      setSubject(data.recommended_subject);
      setVideoLinks(data.videos || []);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParam) {
      handleRecommendation(searchParam);
    }
  }, [searchParam]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Search Results for "{searchParam}"</h2>

      {loading && <p>Loading...</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {subject && (
        <div style={{ marginTop: '30px' }}>
          <h3>Recommended Subject: {subject}</h3>
          {videoLinks.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '20px' }}>
              {videoLinks.map((video, index) => {
                const videoId = extractVideoId(video.url);
                return (
                  <div key={index} style={{ border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                      {videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        ></iframe>
                      ) : (
                        <p style={{ padding: '10px' }}>Invalid YouTube URL</p>
                      )}
                    </div>
                    <div style={{ padding: '10px' }}>
                      <p style={{ fontWeight: 'bold', color: '#333' }}>{video.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No videos found for this subject.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
