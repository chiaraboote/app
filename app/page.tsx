"use client";

import { useState, useEffect } from 'react';

// Define the shape of a single article
interface Article {
  pmid: string;
  title: string;
  classification: 'SUPPORTS' | 'OPPOSES' | 'NEUTRAL';
}

// Define the shape of the entire API response
interface AnalysisResult {
  summary: string;
  articles: Article[];
}

// Define the shape of a history/favorite item
interface SearchItem extends AnalysisResult {
  id: string; // Unique ID for each search
  claim: string;
  date: string;
}

type View = 'search' | 'history' | 'favoritedSearches' | 'favoritedPapers';

export default function Home() {
  const [claim, setClaim] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentSearchItem, setCurrentSearchItem] = useState<SearchItem | null>(null);
  const [view, setView] = useState<View>('search');
  const [history, setHistory] = useState<SearchItem[]>([]);
  const [favoritedSearches, setFavoritedSearches] = useState<SearchItem[]>([]);
  const [favoritedPapers, setFavoritedPapers] = useState<Article[]>([]);
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);
  const [suggestedClaims, setSuggestedClaims] = useState<string[]>([]);

  // Load history & favorites from localStorage on initial render
  useEffect(() => {
    const load = (key: string, setter: Function) => {
      try {
        const saved = localStorage.getItem(key);
        if (saved) setter(JSON.parse(saved));
      } catch (e) { console.error(`Failed to load ${key}`, e); }
    };
    load('nest-history', setHistory);
    load('nest-favorited-searches', setFavoritedSearches);
    load('nest-favorited-papers', setFavoritedPapers);
  }, []);

  const getClaimSuggestions = async () => {
    if (!claim.trim()) {
      alert('Please enter a health claim.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Breaking down claim...');
    setCurrentSearchItem(null);
    setSuggestedClaims([]);

    try {
      const response = await fetch('/api/breakdown-claim', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim }),
      });
      if (!response.ok) throw new Error('Failed to get suggestions.');
      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestedClaims(data.suggestions);
      } else {
        // If breakdown fails or returns no suggestions, analyze it directly
        startAnalysis(claim);
      }
    } catch (error) {
      console.error("Error breaking down claim:", error);
      // Fallback to analyzing the original claim
      startAnalysis(claim);
    }
  };

  const startAnalysis = (claimToAnalyze: string) => {
    setClaim(claimToAnalyze);
    setSuggestedClaims([]);
    setIsLoading(true);
    setLoadingMessage('Analyzing specific claim...');
    setCurrentSearchItem(null);
    analyzeSpecificClaim(claimToAnalyze);
  };

  const analyzeSpecificClaim = async (claimToAnalyze: string) => {
    try {
      const response = await fetch('/api/verify-claim', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: claimToAnalyze }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: AnalysisResult = await response.json();
      const newSearchItem: SearchItem = {
        id: new Date().toISOString(),
        claim: claimToAnalyze,
        date: new Date().toLocaleString(),
        ...data,
      };

      setCurrentSearchItem(newSearchItem);
      setHistory(prevHistory => {
        const updatedHistory = [newSearchItem, ...prevHistory];
        localStorage.setItem('nest-history', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (error) {
      console.error("Error verifying claim:", error);
      const errorItem: SearchItem = {
        id: 'error', claim: 'Error', date: '',
        summary: 'Failed to connect to the analysis server. Please make sure the backend is running.',
        articles: [],
      };
      setCurrentSearchItem(errorItem);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleFavoriteSearch = (item: SearchItem) => {
    const isFav = favoritedSearches.some(fav => fav.id === item.id);
    const updated = isFav
      ? favoritedSearches.filter(fav => fav.id !== item.id)
      : [item, ...favoritedSearches];
    setFavoritedSearches(updated);
    localStorage.setItem('nest-favorited-searches', JSON.stringify(updated));
  };

  const toggleFavoritePaper = (paper: Article) => {
    const isFav = favoritedPapers.some(fav => fav.pmid === paper.pmid);
    const updated = isFav
      ? favoritedPapers.filter(fav => fav.pmid !== paper.pmid)
      : [paper, ...favoritedPapers];
    setFavoritedPapers(updated);
    localStorage.setItem('nest-favorited-papers', JSON.stringify(updated));
  };

  const navigate = (newView: View) => {
    setView(newView);
    setCurrentSearchItem(null);
    setSelectedItem(null);
  };

  const HeartButton = ({ isFavorited, onClick }: { isFavorited: boolean; onClick: (e: React.MouseEvent) => void }) => (
    <button onClick={onClick} className="p-1 text-red-500 hover:text-red-600 focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
      </svg>
    </button>
  );

  const ListItem = ({ item, isFavorite, onToggleFavorite, isSelected, onSelect }: {
    item: SearchItem;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={onSelect}>
        <div>
          <p className="font-semibold text-lg text-gray-800 dark:text-white">{item.claim}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
        </div>
        <div className="flex items-center">
          <HeartButton isFavorited={isFavorite} onClick={onToggleFavorite} />
          <svg className={`w-6 h-6 text-gray-500 transform transition-transform ${isSelected ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {isSelected && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="text-xl font-bold mb-2">Analysis Summary</h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{item.summary}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="bg-green-500 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => navigate('search')} className="text-2xl font-bold">N.E.S.T</button>
          <nav>
            <ul className="flex items-center space-x-6">
              <li><button onClick={() => navigate('search')} className="text-sm font-medium hover:underline">New Search</button></li>
              <li><button onClick={() => navigate('history')} className="text-sm font-medium hover:underline">Previous Searches</button></li>
              <li><button onClick={() => navigate('favoritedSearches')} className="text-sm font-medium hover:underline">Favorited Searches</button></li>
              <li><button onClick={() => navigate('favoritedPapers')} className="text-sm font-medium hover:underline">Favorited Papers</button></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 dark:bg-gray-900">
        {view === 'search' && (
          <div className="w-full max-w-2xl">
            {/* Search Form: only show if no suggestions and no current result */}
            {!suggestedClaims.length && !currentSearchItem && (
              <>
              <div className="text-center">
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">N.E.S.T</h1>
                <p className="text-md text-gray-500 dark:text-gray-400 italic mb-8">Nutrition. Evidence. Science. Trust</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <label htmlFor="claim-textarea" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Enter a health claim to analyze:</label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">(make it as specific as possible)</p>
                <textarea id="claim-textarea" className="w-full h-32 p-4 border rounded-md bg-gray-50 dark:bg-gray-700" placeholder="e.g., 'Drinking lemon water every morning boosts your metabolism.'" value={claim} onChange={(e) => setClaim(e.target.value)} disabled={isLoading} />
                <button onClick={getClaimSuggestions} disabled={isLoading} className="mt-4 w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400">
                  {isLoading ? loadingMessage : 'Analyze Claim'}
                </button>
              </div>
              </>
            )}

            {/* Suggested Claims View */}
            {suggestedClaims.length > 0 && !isLoading && (
              <div className="mt-8 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-left">
                <h2 className="text-2xl font-bold mb-4">Is your claim too broad?</h2>
                <p className="mb-6">We've broken it down into more specific questions. Please choose one to analyze:</p>
                <div className="space-y-3">
                  {suggestedClaims.map((q, i) => (
                    <button key={i} onClick={() => startAnalysis(q)} className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <button onClick={() => startAnalysis(claim)} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                    Or, continue with the original claim: "{claim}"
                  </button>
                </div>
              </div>
            )}
            
            {/* Analysis Result View */}
            {currentSearchItem && (
              <div className="mt-8 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-left">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {currentSearchItem.claim}
                  </h2>
                  <HeartButton
                    isFavorited={favoritedSearches.some(fav => fav.id === currentSearchItem.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteSearch(currentSearchItem);
                    }}
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-xl font-bold mb-2">Summary</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{currentSearchItem.summary}</p>
                </div>
                
                {currentSearchItem.articles && currentSearchItem.articles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4">Relevant Papers</h3>
                    <div className="space-y-4">
                      {currentSearchItem.articles.map((article) => (
                        <div key={article.pmid} className="p-4 border rounded-lg flex justify-between items-center">
                          <div>
                            <a href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">{article.title}</a>
                            <p className={`text-sm font-medium mt-1 ${article.classification === 'SUPPORTS' ? 'text-green-600' : article.classification === 'OPPOSES' ? 'text-red-600' : 'text-gray-500'}`}>Classification: {article.classification}</p>
                          </div>
                          <HeartButton isFavorited={favoritedPapers.some(p => p.pmid === article.pmid)} onClick={(e) => { e.stopPropagation(); toggleFavoritePaper(article); }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {(view === 'history' || view === 'favoritedSearches') && (
          <div className="w-full max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">{view === 'history' ? 'Search History' : 'Favorited Searches'}</h1>
            {(view === 'history' ? history : favoritedSearches).length > 0 ? (
              <div className="space-y-4">
                {(view === 'history' ? history : favoritedSearches).map(item => (
                  <ListItem 
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onSelect={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                    isFavorite={favoritedSearches.some(fav => fav.id === item.id)}
                    onToggleFavorite={(e: React.MouseEvent) => { e.stopPropagation(); toggleFavoriteSearch(item); }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-8">Your {view === 'history' ? 'history' : 'favorited searches'} list is empty.</p>
            )}
          </div>
        )}

        {view === 'favoritedPapers' && (
          <div className="w-full max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-center">Favorited Papers</h1>
            {favoritedPapers.length > 0 ? (
              <div className="space-y-4">
                {favoritedPapers.map(paper => (
                  <div key={paper.pmid} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex justify-between items-center">
                     <div>
                        <a href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`} target="_blank" rel="noopener noreferrer" className="font-semibold text-lg text-blue-600 hover:underline">{paper.title}</a>
                        <p className={`text-sm font-medium mt-1 ${paper.classification === 'SUPPORTS' ? 'text-green-600' : paper.classification === 'OPPOSES' ? 'text-red-600' : 'text-gray-500'}`}>Original Classification: {paper.classification}</p>
                      </div>
                      <HeartButton isFavorited={true} onClick={(e) => { e.stopPropagation(); toggleFavoritePaper(paper); }} />
                  </div>
                ))}
              </div>
            ) : <p className="text-center text-gray-500 mt-8">You haven't favorited any papers yet.</p>}
          </div>
        )}
      </main>
    </>
  );
}