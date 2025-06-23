import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Loader, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { moviesAPI, watchlistAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import EpisodeManager from '../components/EpisodeManager';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border-left: 4px solid #e50914;
  padding-left: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0.75rem 1rem;
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

const Home = () => {
  const [selectedShow, setSelectedShow] = useState(null);
  const [hideWatched, setHideWatched] = useState(false);
  const [moviePage, setMoviePage] = useState(1);
  const [tvPage, setTvPage] = useState(1);

  // Reset pages when hideWatched changes
  React.useEffect(() => {
    setMoviePage(1);
    setTvPage(1);
    setAllMovies([]);
    setAllTVShows([]);
    setLoadedMoviePages(new Set([1]));
    setLoadedTVPages(new Set([1]));
  }, [hideWatched]);
  const { data: popularMovies, isLoading: loadingMovies } = useQuery(
    ['popularMovies', moviePage],
    () => moviesAPI.getPopularMovies(moviePage),
    {
      select: (response) => response.data,
      keepPreviousData: true,
    }
  );

  const { data: popularTV, isLoading: loadingTV } = useQuery(
    ['popularTV', tvPage],
    () => moviesAPI.getPopularTV(tvPage),
    {
      select: (response) => response.data,
      keepPreviousData: true,
    }
  );

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

  const handleMarkWatched = async (id, watched) => {
    try {
      await watchlistAPI.markAsWatched(id, watched);
      toast.success(watched ? 'Marcado como visto' : 'Marcado como no visto');
      refetchWatchlist();
    } catch (error) {
      toast.error('Error al actualizar el estado');
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

  const handleMarkLiked = async (id, liked) => {
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
  };

  const handleRemoveFromWatchlist = async (id) => {
    try {
      await watchlistAPI.removeFromWatchlist(id);
      toast.success('Eliminado de tu lista');
      refetchWatchlist();
    } catch (error) {
      toast.error('Error al eliminar de la lista');
    }
  };

  const handleManageEpisodes = (show) => {
    setSelectedShow(show);
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

  const filterWatchedItems = (items) => {
    if (!hideWatched || !items) return items;
    return items.filter(item => {
      const watched = isItemWatched(item.id, item.media_type || 'movie');
      return !watched;
    });
  };

  // Función para verificar duplicados
  const removeDuplicates = (items) => {
    const seen = new Set();
    return items.filter(item => {
      const key = `${item.id}-${item.media_type}`;
      if (seen.has(key)) {
        console.log(`Duplicado encontrado y eliminado: ${item.title || item.name} (${item.id})`);
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  // Acumular resultados de múltiples páginas
  const [allMovies, setAllMovies] = useState([]);
  const [allTVShows, setAllTVShows] = useState([]);
  const [loadedMoviePages, setLoadedMoviePages] = useState(new Set([1])); // Marca página 1 como ya procesada
  const [loadedTVPages, setLoadedTVPages] = useState(new Set([1])); // Marca página 1 como ya procesada

  React.useEffect(() => {
    if (popularMovies?.results) {
      if (moviePage === 1 && allMovies.length === 0) {
        // Primera carga - inicializar
        setAllMovies(popularMovies.results.map(movie => ({...movie, media_type: 'movie'})));
      } else if (moviePage > 1 && !loadedMoviePages.has(moviePage)) {
        // Cargar páginas adicionales - filtrar duplicados
        setAllMovies(prev => {
          const newMovies = popularMovies.results
            .map(movie => ({...movie, media_type: 'movie'}))
            .filter(newMovie => !prev.some(existingMovie => existingMovie.id === newMovie.id));
          console.log(`Películas página ${moviePage}: ${popularMovies.results.length} resultados, ${newMovies.length} nuevos (${popularMovies.results.length - newMovies.length} duplicados filtrados)`);
          return [...prev, ...newMovies];
        });
        setLoadedMoviePages(prev => new Set([...prev, moviePage]));
      }
    }
  }, [popularMovies, moviePage, loadedMoviePages, allMovies.length]);

  React.useEffect(() => {
    if (popularTV?.results) {
      if (tvPage === 1 && allTVShows.length === 0) {
        // Primera carga - inicializar
        setAllTVShows(popularTV.results.map(show => ({...show, media_type: 'tv'})));
      } else if (tvPage > 1 && !loadedTVPages.has(tvPage)) {
        // Cargar páginas adicionales - filtrar duplicados
        setAllTVShows(prev => {
          const newShows = popularTV.results
            .map(show => ({...show, media_type: 'tv'}))
            .filter(newShow => !prev.some(existingShow => existingShow.id === newShow.id));
          console.log(`Series página ${tvPage}: ${popularTV.results.length} resultados, ${newShows.length} nuevos (${popularTV.results.length - newShows.length} duplicados filtrados)`);
          return [...prev, ...newShows];
        });
        setLoadedTVPages(prev => new Set([...prev, tvPage]));
      }
    }
  }, [popularTV, tvPage, loadedTVPages, allTVShows.length]);

  const filteredMovies = filterWatchedItems(removeDuplicates(allMovies));
  const filteredTVShows = filterWatchedItems(removeDuplicates(allTVShows));

  if (loadingMovies || loadingTV) {
    return (
      <LoadingContainer>
        <Loader className="animate-spin" size={24} />
        Cargando contenido...
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Section>
        <FilterContainer>
          <SectionTitle>Películas Populares</SectionTitle>
          <SwitchContainer>
            <SwitchLabel>
              {hideWatched ? <EyeOff size={16} /> : <Eye size={16} />}
              Ocultar vistos
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
        </FilterContainer>
        {filteredMovies?.length > 0 ? (
          <>
            <Grid>
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  item={movie}
                  inWatchlist={isInWatchlist(movie.id, 'movie')}
                  watchlistItem={getWatchlistItem(movie.id, 'movie')}
                  onAddToWatchlist={handleAddToWatchlist}
                  onMarkWatched={isInWatchlist(movie.id, 'movie') ? 
                    (id, watched) => handleMarkWatchedDirect(watched, {...movie, media_type: 'movie'}) :
                    handleMarkWatchedDirect
                  }
                  onMarkLiked={handleMarkLiked}
                />
              ))}
            </Grid>
            {popularMovies && moviePage < popularMovies.total_pages && (
              <LoadMoreButton 
                onClick={() => setMoviePage(prev => prev + 1)}
                disabled={loadingMovies}
              >
                {loadingMovies ? 'Cargando...' : 'Cargar más películas'}
              </LoadMoreButton>
            )}
          </>
        ) : hideWatched ? (
          <EmptyState>
            <EyeOff size={48} />
            <p>No hay películas populares sin ver</p>
          </EmptyState>
        ) : (
          <EmptyState>
            <AlertCircle size={48} />
            <p>No se pudieron cargar las películas populares</p>
          </EmptyState>
        )}
      </Section>

      <Section>
        <SectionTitle>Series Populares</SectionTitle>
        {filteredTVShows?.length > 0 ? (
          <>
            <Grid>
              {filteredTVShows.map((show) => (
                <MovieCard
                  key={show.id}
                  item={show}
                  inWatchlist={isInWatchlist(show.id, 'tv')}
                  watchlistItem={getWatchlistItem(show.id, 'tv')}
                  onAddToWatchlist={handleAddToWatchlist}
                  onMarkWatched={isInWatchlist(show.id, 'tv') ? 
                    (id, watched) => handleMarkWatchedDirect(watched, {...show, media_type: 'tv'}) :
                    handleMarkWatchedDirect
                  }
                  onMarkLiked={handleMarkLiked}
                />
              ))}
            </Grid>
            {popularTV && tvPage < popularTV.total_pages && (
              <LoadMoreButton 
                onClick={() => setTvPage(prev => prev + 1)}
                disabled={loadingTV}
              >
                {loadingTV ? 'Cargando...' : 'Cargar más series'}
              </LoadMoreButton>
            )}
          </>
        ) : hideWatched ? (
          <EmptyState>
            <EyeOff size={48} />
            <p>No hay series populares sin ver</p>
          </EmptyState>
        ) : (
          <EmptyState>
            <AlertCircle size={48} />
            <p>No se pudieron cargar las series populares</p>
          </EmptyState>
        )}
      </Section>

      {watchlist && watchlist.length > 0 && (
        <Section>
          <SectionTitle>Tu Lista Reciente</SectionTitle>
          <Grid>
            {watchlist.slice(0, 6).map((item) => (
              <MovieCard
                key={`${item.tmdb_id}-${item.media_type}`}
                item={{
                  id: item.tmdb_id,
                  title: item.title,
                  name: item.title,
                  poster_path: item.poster_path,
                  poster_url: item.poster_url,
                  release_date: item.release_date,
                  first_air_date: item.release_date,
                  media_type: item.media_type,
                }}
                inWatchlist={true}
                watchlistItem={item}
                onMarkWatched={(watched) => handleMarkWatched(item.id, watched)}
                onMarkLiked={(liked) => handleMarkLiked(item.id, liked)}
                onRemoveFromWatchlist={() => handleRemoveFromWatchlist(item.id)}
                onManageEpisodes={item.media_type === 'tv' ? handleManageEpisodes : null}
              />
            ))}
          </Grid>
        </Section>
      )}
      
      {selectedShow && (
        <EpisodeManager 
          show={selectedShow} 
          onClose={() => setSelectedShow(null)} 
        />
      )}
    </Container>
  );
};

export default Home;