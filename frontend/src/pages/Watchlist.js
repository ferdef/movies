import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { List, Filter, Loader, Check, Heart, X, Clock, HelpCircle, ThumbsDown } from 'lucide-react';
import { watchlistAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import EpisodeManager from '../components/EpisodeManager';
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

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #333;
  overflow-x: auto;
`;

const Tab = styled.button`
  background: transparent;
  color: ${props => props.active ? '#e50914' : '#aaa'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#e50914' : 'transparent'};
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: ${props => props.active ? '#e50914' : 'white'};
  }
`;

const TabCounter = styled.span`
  background: ${props => props.active ? '#e50914' : '#333'};
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const FilterLabel = styled.span`
  color: #aaa;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? '#e50914' : 'rgba(30, 30, 30, 0.9)'};
  color: white;
  border: 1px solid ${props => props.active ? '#e50914' : '#333'};
  border-radius: 20px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.active ? '#b8070f' : 'rgba(50, 50, 50, 0.9)'};
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #e50914;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #aaa;
  font-size: 0.9rem;
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

const Watchlist = () => {
  const [activeTab, setActiveTab] = useState('toWatch'); // toWatch, watchedUnrated, liked, disliked
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  const [selectedShow, setSelectedShow] = useState(null);

  const { data: allWatchlist, isLoading, refetch } = useQuery(
    'watchlist',
    () => watchlistAPI.getWatchlist(),
    {
      select: (response) => response.data,
    }
  );

  // Filtrar los elementos basándose en la pestaña activa y filtros
  const filteredWatchlist = React.useMemo(() => {
    if (!allWatchlist) return [];
    
    let filtered = allWatchlist;
    
    // Filtrar por pestaña
    switch (activeTab) {
      case 'toWatch':
        filtered = filtered.filter(item => !item.watched);
        break;
      case 'watchedUnrated':
        filtered = filtered.filter(item => item.watched && item.liked === null);
        break;
      case 'liked':
        filtered = filtered.filter(item => item.watched && item.liked === true);
        break;
      case 'disliked':
        filtered = filtered.filter(item => item.watched && item.liked === false);
        break;
      default:
        break;
    }
    
    // Filtrar por tipo de media
    if (mediaTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.media_type === mediaTypeFilter);
    }
    
    return filtered;
  }, [allWatchlist, activeTab, mediaTypeFilter]);

  const handleMarkWatched = async (id, watched) => {
    try {
      await watchlistAPI.markAsWatched(id, watched);
      toast.success(watched ? 'Marcado como visto' : 'Marcado como no visto');
      refetch();
    } catch (error) {
      toast.error('Error al actualizar el estado');
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
      refetch();
    } catch (error) {
      toast.error('Error al actualizar la valoración');
    }
  };

  const handleRemoveFromWatchlist = async (id) => {
    try {
      await watchlistAPI.removeFromWatchlist(id);
      toast.success('Eliminado de tu lista');
      refetch();
    } catch (error) {
      toast.error('Error al eliminar de la lista');
    }
  };

  const handleManageEpisodes = (show) => {
    setSelectedShow(show);
  };

  const stats = React.useMemo(() => {
    if (!allWatchlist) return { toWatch: 0, watchedUnrated: 0, liked: 0, disliked: 0, total: 0 };
    
    const watched = allWatchlist.filter(item => item.watched);
    
    return {
      toWatch: allWatchlist.filter(item => !item.watched).length,
      watchedUnrated: watched.filter(item => item.liked === null).length,
      liked: watched.filter(item => item.liked === true).length,
      disliked: watched.filter(item => item.liked === false).length,
      total: allWatchlist.length,
    };
  }, [allWatchlist]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <Loader className="animate-spin" size={24} />
        Cargando tu lista...
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <List size={32} />
          Mi Lista
        </Title>
      </Header>

      <TabsContainer>
        <Tab
          active={activeTab === 'toWatch'}
          onClick={() => setActiveTab('toWatch')}
        >
          <Clock size={18} />
          Por ver
          <TabCounter active={activeTab === 'toWatch'}>{stats.toWatch}</TabCounter>
        </Tab>
        <Tab
          active={activeTab === 'watchedUnrated'}
          onClick={() => setActiveTab('watchedUnrated')}
        >
          <HelpCircle size={18} />
          Vistos sin valorar
          <TabCounter active={activeTab === 'watchedUnrated'}>{stats.watchedUnrated}</TabCounter>
        </Tab>
        <Tab
          active={activeTab === 'liked'}
          onClick={() => setActiveTab('liked')}
        >
          <Heart size={18} />
          Me gustaron
          <TabCounter active={activeTab === 'liked'}>{stats.liked}</TabCounter>
        </Tab>
        <Tab
          active={activeTab === 'disliked'}
          onClick={() => setActiveTab('disliked')}
        >
          <ThumbsDown size={18} />
          No me gustaron
          <TabCounter active={activeTab === 'disliked'}>{stats.disliked}</TabCounter>
        </Tab>
      </TabsContainer>

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>
            <Filter size={16} />
            Filtrar por tipo:
          </FilterLabel>
          <FilterButton
            active={mediaTypeFilter === 'all'}
            onClick={() => setMediaTypeFilter('all')}
          >
            Todo
          </FilterButton>
          <FilterButton
            active={mediaTypeFilter === 'movie'}
            onClick={() => setMediaTypeFilter('movie')}
          >
            Películas
          </FilterButton>
          <FilterButton
            active={mediaTypeFilter === 'tv'}
            onClick={() => setMediaTypeFilter('tv')}
          >
            Series
          </FilterButton>
        </FilterGroup>
      </FiltersContainer>

      {filteredWatchlist && filteredWatchlist.length > 0 ? (
        <Grid>
          {filteredWatchlist.map((item) => (
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
              onMarkWatched={(id, watched) => handleMarkWatched(item.id, watched)}
              onMarkLiked={(id, liked) => handleMarkLiked(id, liked)}
              onRemoveFromWatchlist={() => handleRemoveFromWatchlist(item.id)}
              onManageEpisodes={item.media_type === 'tv' ? handleManageEpisodes : null}
            />
          ))}
        </Grid>
      ) : (
        <EmptyState>
          {activeTab === 'toWatch' && (
            <>
              <Clock size={64} color="#666" />
              <h3 style={{ color: '#666', marginTop: '1rem' }}>
                No hay elementos por ver
              </h3>
              <p>Busca películas y series para añadirlas a tu lista</p>
            </>
          )}
          {activeTab === 'watchedUnrated' && (
            <>
              <HelpCircle size={64} color="#666" />
              <h3 style={{ color: '#666', marginTop: '1rem' }}>
                No hay elementos vistos sin valorar
              </h3>
              <p>Los elementos que marques como vistos aparecerán aquí hasta que los valores</p>
            </>
          )}
          {activeTab === 'liked' && (
            <>
              <Heart size={64} color="#666" />
              <h3 style={{ color: '#666', marginTop: '1rem' }}>
                No hay elementos que te gusten
              </h3>
              <p>Marca elementos como "me gusta" para verlos aquí</p>
            </>
          )}
          {activeTab === 'disliked' && (
            <>
              <ThumbsDown size={64} color="#666" />
              <h3 style={{ color: '#666', marginTop: '1rem' }}>
                No hay elementos que no te gusten
              </h3>
              <p>Marca elementos como "no me gusta" para verlos aquí</p>
            </>
          )}
        </EmptyState>
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

export default Watchlist;