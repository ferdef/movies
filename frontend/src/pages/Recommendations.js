import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Star, Settings, Calendar, Loader, AlertCircle } from 'lucide-react';
import { recommendationsAPI, watchlistAPI, moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: white;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FiltersContainer = styled.div`
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FiltersTitle = styled.h3`
  color: white;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  color: #aaa;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Select = styled.select`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid #555;
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #e50914;
  }
  
  option {
    background: #1a1a1a;
    color: white;
  }
`;

const Input = styled.input`
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid #555;
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #e50914;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const RangeGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  background: ${props => props.active ? '#e50914' : 'rgba(30, 30, 30, 0.9)'};
  color: white;
  border: 1px solid ${props => props.active ? '#e50914' : '#333'};
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.active ? '#b8070f' : 'rgba(50, 50, 50, 0.9)'};
  }
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

const currentYear = new Date().getFullYear();

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [mediaType, setMediaType] = useState('movie');
  const [filters, setFilters] = useState({
    year_from: currentYear - 10,
    year_to: currentYear,
    vote_average_min: 6,
    vote_average_max: 10,
    genres: '',
    exclude_genres: ''
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce filters to avoid too many API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 1000); // 1 segundo de delay

    return () => clearTimeout(timer);
  }, [filters]);

  const { data: genres } = useQuery(
    'genres',
    () => moviesAPI.getGenres(),
    {
      select: (response) => response.data,
    }
  );

  const { data: recommendations, isLoading: loadingGeneral, error: errorGeneral } = useQuery(
    ['recommendations', mediaType, debouncedFilters],
    () => recommendationsAPI.getRecommendations({
      media_type: mediaType,
      ...debouncedFilters
    }),
    {
      enabled: activeTab === 'general',
      select: (response) => response.data,
      retry: 2,
      retryDelay: 5000, // 5 segundos entre reintentos
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    }
  );

  const { data: personalizedRecs, isLoading: loadingPersonalized, error: errorPersonalized } = useQuery(
    ['personalizedRecommendations', mediaType],
    () => recommendationsAPI.getPersonalizedRecommendations({
      media_type: mediaType
    }),
    {
      enabled: activeTab === 'personalized',
      select: (response) => response.data,
      retry: 2,
      retryDelay: 5000, // 5 segundos entre reintentos
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    }
  );

  const { data: watchlist, refetch: refetchWatchlist } = useQuery(
    'watchlist',
    () => watchlistAPI.getWatchlist(),
    {
      select: (response) => response.data,
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddToWatchlist = async (item) => {
    try {
      await watchlistAPI.addToWatchlist({
        tmdb_id: item.id,
        media_type: item.media_type || mediaType,
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
          media_type: item.media_type || mediaType,
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

  const isInWatchlist = (tmdbId, itemMediaType) => {
    return watchlist?.some(
      item => item.tmdb_id === tmdbId && item.media_type === (itemMediaType || mediaType)
    );
  };

  const getWatchlistItem = (tmdbId, itemMediaType) => {
    return watchlist?.find(
      item => item.tmdb_id === tmdbId && item.media_type === (itemMediaType || mediaType)
    );
  };

  const currentGenres = mediaType === 'movie' ? genres?.movie : genres?.tv;
  const currentResults = activeTab === 'general' ? recommendations?.results : personalizedRecs?.results;
  const isLoading = activeTab === 'general' ? loadingGeneral : loadingPersonalized;
  const currentError = activeTab === 'general' ? errorGeneral : errorPersonalized;

  return (
    <Container>
      <Header>
        <Title>
          <Star size={32} />
          Recomendaciones
        </Title>
      </Header>

      <TabsContainer>
        <Tab
          active={activeTab === 'general'}
          onClick={() => setActiveTab('general')}
        >
          Recomendaciones Generales
        </Tab>
        <Tab
          active={activeTab === 'personalized'}
          onClick={() => setActiveTab('personalized')}
        >
          Basado en tus gustos
        </Tab>
      </TabsContainer>

      <FiltersContainer>
        <FiltersTitle>
          <Settings size={20} />
          Filtros
        </FiltersTitle>
        
        <FiltersGrid>
          <FilterGroup>
            <FilterLabel>Tipo de contenido</FilterLabel>
            <Select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
            >
              <option value="movie">Películas</option>
              <option value="tv">Series</option>
            </Select>
          </FilterGroup>

          {activeTab === 'general' && (
            <>
              <FilterGroup>
                <FilterLabel>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Rango de años
                </FilterLabel>
                <RangeGroup>
                  <Input
                    type="number"
                    min="1900"
                    max={currentYear}
                    value={filters.year_from}
                    onChange={(e) => handleFilterChange('year_from', e.target.value)}
                    placeholder="Desde"
                  />
                  <span style={{ color: '#aaa' }}>-</span>
                  <Input
                    type="number"
                    min="1900"
                    max={currentYear}
                    value={filters.year_to}
                    onChange={(e) => handleFilterChange('year_to', e.target.value)}
                    placeholder="Hasta"
                  />
                </RangeGroup>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Valoración mínima</FilterLabel>
                <RangeGroup>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={filters.vote_average_min}
                    onChange={(e) => handleFilterChange('vote_average_min', e.target.value)}
                  />
                  <span style={{ color: '#aaa' }}>-</span>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={filters.vote_average_max}
                    onChange={(e) => handleFilterChange('vote_average_max', e.target.value)}
                  />
                </RangeGroup>
              </FilterGroup>

              {currentGenres && (
                <>
                  <FilterGroup>
                    <FilterLabel>Incluir géneros</FilterLabel>
                    <Select
                      value={filters.genres}
                      onChange={(e) => handleFilterChange('genres', e.target.value)}
                    >
                      <option value="">Todos los géneros</option>
                      {currentGenres.map(genre => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                    </Select>
                  </FilterGroup>

                  <FilterGroup>
                    <FilterLabel>Excluir géneros</FilterLabel>
                    <Select
                      value={filters.exclude_genres}
                      onChange={(e) => handleFilterChange('exclude_genres', e.target.value)}
                    >
                      <option value="">Ninguno</option>
                      {currentGenres.map(genre => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                    </Select>
                  </FilterGroup>
                </>
              )}
            </>
          )}
        </FiltersGrid>
      </FiltersContainer>

      {currentError ? (
        <EmptyState>
          <AlertCircle size={64} color="#666" />
          <h3 style={{ color: '#666', marginTop: '1rem' }}>
            Error al cargar recomendaciones
          </h3>
          <p>
            {currentError.response?.status === 429 
              ? 'Demasiadas peticiones. Por favor, espera un momento e intenta de nuevo.'
              : 'No se pudieron cargar las recomendaciones. Intenta de nuevo más tarde.'}
          </p>
        </EmptyState>
      ) : isLoading ? (
        <LoadingContainer>
          <Loader className="animate-spin" size={24} />
          Cargando recomendaciones...
        </LoadingContainer>
      ) : currentResults?.length > 0 ? (
        <Grid>
          {currentResults.map((item) => (
            <MovieCard
              key={item.id}
              item={{ ...item, media_type: item.media_type || mediaType }}
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
      ) : activeTab === 'personalized' ? (
        <EmptyState>
          <Star size={64} color="#666" />
          <h3 style={{ color: '#666', marginTop: '1rem' }}>
            Sin recomendaciones personalizadas
          </h3>
          <p>Marca algunas películas/series como "me gusta" para obtener recomendaciones personalizadas</p>
        </EmptyState>
      ) : (
        <EmptyState>
          <AlertCircle size={64} color="#666" />
          <h3 style={{ color: '#666', marginTop: '1rem' }}>
            No se encontraron recomendaciones
          </h3>
          <p>Intenta ajustar los filtros para encontrar contenido</p>
        </EmptyState>
      )}
    </Container>
  );
};

export default Recommendations;