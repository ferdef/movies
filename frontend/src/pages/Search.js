import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Search as SearchIcon, Loader, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { moviesAPI, watchlistAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
`;

const SearchContainer = styled.div`
  margin-bottom: 2rem;
`;

const SearchBox = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1rem 1rem 1rem 3rem;
  color: white;
  font-size: 1.1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #e50914;
    box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? '#e50914' : 'rgba(30, 30, 30, 0.9)'};
  color: white;
  border: 1px solid ${props => props.active ? '#e50914' : '#333'};
  border-radius: 20px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#b8070f' : 'rgba(50, 50, 50, 0.9)'};
  }
`;

const ResultsContainer = styled.div`
  margin-top: 2rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ResultsTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ResultsCount = styled.span`
  color: #aaa;
  font-size: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #aaa;
  gap: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #aaa;
`;

const LoadMoreButton = styled.button`
  background: #e50914;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 2rem auto;
  display: block;
  
  &:hover {
    background: #b8070f;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-top: 1rem;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  cursor: pointer;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.checked ? '#e50914' : '#ccc'};
  transition: .4s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: ${props => props.checked ? '26px' : '3px'};
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const SwitchLabel = styled.span`
  color: white;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all'); // all, movie, tv
  const [hideWatched, setHideWatched] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [loadedPages, setLoadedPages] = useState(new Set([1])); // Marca página 1 como ya procesada

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
      setAllResults([]); // Reset results when search changes
      setLoadedPages(new Set([1])); // Reset loaded pages, marca página 1
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading, error } = useQuery(
    ['search', debouncedQuery, page],
    () => moviesAPI.search(debouncedQuery, page),
    {
      enabled: !!debouncedQuery,
      select: (response) => response.data,
      keepPreviousData: true,
    }
  );

  // Acumular resultados cuando se cargan más páginas
  React.useEffect(() => {
    if (searchResults?.results) {
      if (page === 1 && allResults.length === 0) {
        // Primera carga - inicializar
        setAllResults(searchResults.results);
      } else if (page > 1 && !loadedPages.has(page)) {
        // Cargar páginas adicionales
        setAllResults(prev => {
          // Evitar duplicados comparando IDs y media_type
          const newResults = searchResults.results.filter(
            newItem => !prev.some(existingItem => 
              existingItem.id === newItem.id && 
              (existingItem.media_type || 'movie') === (newItem.media_type || 'movie')
            )
          );
          console.log(`Página ${page}: ${searchResults.results.length} resultados, ${newResults.length} nuevos (${searchResults.results.length - newResults.length} duplicados filtrados)`);
          return [...prev, ...newResults];
        });
        setLoadedPages(prev => new Set([...prev, page]));
      }
    }
  }, [searchResults, page, loadedPages, allResults.length]);

  const { data: watchlist, refetch: refetchWatchlist } = useQuery(
    'watchlist',
    () => watchlistAPI.getWatchlist(),
    {
      select: (response) => response.data,
    }
  );

  const handleAddToWatchlist = async (item) => {
    try {
      await watchlistAPI.addToWatchlist({
        tmdb_id: item.id,
        media_type: item.media_type,
        title: item.title || item.name,
        poster_path: item.poster_path,
        release_date: item.release_date || item.first_air_date,
      });
      
      toast.success('Añadido a tu lista');
      refetchWatchlist();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Ya está en tu lista');
      } else {
        toast.error('Error al añadir a la lista');
      }
    }
  };

  const handleMarkWatchedDirect = async (watched, item) => {
    try {
      const existingItem = getWatchlistItem(item.id, item.media_type);
      
      if (existingItem) {
        // Si ya está en la lista, solo actualizar el estado
        if (existingItem.watched === watched) {
          // No hacer nada si ya está en el estado deseado
          return;
        }
        await watchlistAPI.markAsWatched(existingItem.id, watched);
        toast.success(watched ? 'Marcado como visto' : 'Marcado como no visto');
        refetchWatchlist();
      } else {
        // Si no está en la lista, añadirlo primero
        const response = await watchlistAPI.addToWatchlist({
          tmdb_id: item.id,
          media_type: item.media_type,
          title: item.title || item.name,
          poster_path: item.poster_path,
          release_date: item.release_date || item.first_air_date,
        });
        
        // Marcar como visto inmediatamente
        await watchlistAPI.markAsWatched(response.data.id, watched);
        toast.success('Marcado como visto');
        refetchWatchlist();
      }
    } catch (error) {
      console.error('Error marking as watched:', error);
      toast.error('Error al marcar como visto');
    }
  };

  const isInWatchlist = (tmdbId, mediaType) => {
    return watchlist?.some(
      item => item.tmdb_id === tmdbId && item.media_type === mediaType
    );
  };

  const getWatchlistItem = (tmdbId, mediaType) => {
    return watchlist?.find(
      item => item.tmdb_id === tmdbId && item.media_type === mediaType
    );
  };

  const isItemWatched = (tmdbId, mediaType) => {
    const item = getWatchlistItem(tmdbId, mediaType);
    return item?.watched || false;
  };

  const filteredResults = allResults.filter(item => {
    // Filtrar por tipo de media
    if (filter !== 'all' && item.media_type !== filter) {
      return false;
    }
    
    // Filtrar elementos vistos si está activado
    if (hideWatched && isItemWatched(item.id, item.media_type)) {
      return false;
    }
    
    return true;
  });

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <Container>
      <SearchContainer>
        <SearchBox>
          <SearchIconWrapper>
            <SearchIcon size={20} />
          </SearchIconWrapper>
          <SearchInput
            type="text"
            placeholder="Buscar películas y series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>
        
        <FiltersContainer>
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            Todo
          </FilterButton>
          <FilterButton
            active={filter === 'movie'}
            onClick={() => setFilter('movie')}
          >
            Películas
          </FilterButton>
          <FilterButton
            active={filter === 'tv'}
            onClick={() => setFilter('tv')}
          >
            Series
          </FilterButton>
        </FiltersContainer>
        
        <SwitchContainer>
          <SwitchLabel>
            {hideWatched ? <EyeOff size={16} /> : <Eye size={16} />}
            Ocultar elementos ya vistos
          </SwitchLabel>
          <Switch>
            <SwitchInput
              type="checkbox"
              checked={hideWatched}
              onChange={(e) => setHideWatched(e.target.checked)}
            />
            <SwitchSlider checked={hideWatched} />
          </Switch>
        </SwitchContainer>
      </SearchContainer>

      {debouncedQuery && (
        <ResultsContainer>
          <ResultsHeader>
            <ResultsTitle>
              Resultados para "{debouncedQuery}"
            </ResultsTitle>
            {searchResults && (
              <ResultsCount>
                {filteredResults.length} de {allResults.length} resultados mostrados
                {hideWatched && ' (ocultando vistos)'}
              </ResultsCount>
            )}
          </ResultsHeader>

          {isLoading ? (
            <LoadingContainer>
              <Loader className="animate-spin" size={24} />
              Buscando...
            </LoadingContainer>
          ) : error ? (
            <EmptyState>
              <AlertCircle size={48} />
              <p>Error al buscar contenido</p>
            </EmptyState>
          ) : filteredResults.length > 0 ? (
            <>
              <Grid>
                {filteredResults.map((item) => (
                  <MovieCard
                    key={`${item.id}-${item.media_type}`}
                    item={item}
                    inWatchlist={isInWatchlist(item.id, item.media_type)}
                    watchlistItem={getWatchlistItem(item.id, item.media_type)}
                    onAddToWatchlist={handleAddToWatchlist}
                    onMarkWatched={isInWatchlist(item.id, item.media_type) ? 
                      (id, watched) => handleMarkWatchedDirect(watched, item) :
                      handleMarkWatchedDirect
                    }
                    onMarkLiked={async (id, liked) => {
                      try {
                        await watchlistAPI.markAsLiked(id, liked);
                        toast.success(
                          liked === true ? 'Marcado como me gusta' : 
                          liked === false ? 'Marcado como no me gusta' : 
                          'Valoración eliminada'
                        );
                        refetchWatchlist();
                      } catch (error) {
                        toast.error('Error al actualizar la valoración');
                      }
                    }}
                  />
                ))}
              </Grid>
              
              {searchResults && page < searchResults.total_pages && (
                <LoadMoreButton 
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'Cargando...' : 'Cargar más resultados'}
                </LoadMoreButton>
              )}
            </>
          ) : debouncedQuery && hideWatched ? (
            <EmptyState>
              <EyeOff size={48} />
              <p>No se encontraron resultados sin ver para "{debouncedQuery}"</p>
              <p>Intenta desactivar el filtro o buscar otros términos</p>
            </EmptyState>
          ) : debouncedQuery ? (
            <EmptyState>
              <AlertCircle size={48} />
              <p>No se encontraron resultados para "{debouncedQuery}"</p>
              <p>Intenta con otros términos de búsqueda</p>
            </EmptyState>
          ) : null}
        </ResultsContainer>
      )}

      {!debouncedQuery && (
        <EmptyState>
          <SearchIcon size={64} color="#666" />
          <h3 style={{ color: '#666', marginTop: '1rem' }}>
            Busca películas y series
          </h3>
          <p>Usa el campo de búsqueda para encontrar tu contenido favorito</p>
        </EmptyState>
      )}
    </Container>
  );
};

export default Search;