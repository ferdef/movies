import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Check, Calendar, Play, Eye, EyeOff } from 'lucide-react';
import { moviesAPI, watchlistAPI } from '../services/api';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContainer = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  color: white;
  font-size: 1.5rem;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const Content = styled.div`
  padding: 2rem;
`;

const SeasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SeasonCard = styled.div`
  background: rgba(30, 30, 30, 0.9);
  border-radius: 12px;
  border: 1px solid #333;
  overflow: hidden;
`;

const SeasonHeader = styled.div`
  padding: 1rem 1.5rem;
  background: rgba(40, 40, 40, 0.9);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SeasonTitle = styled.h3`
  color: white;
  margin: 0;
  font-size: 1.1rem;
`;

const SeasonActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? '#16a34a' : 'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-1px);
  }
`;

const EpisodeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
`;

const EpisodeCard = styled.div`
  background: rgba(20, 20, 20, 0.9);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid ${props => props.watched ? '#22c55e' : '#333'};
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.watched ? '#16a34a' : '#555'};
  }
`;

const EpisodeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const EpisodeNumber = styled.span`
  color: #e50914;
  font-weight: 600;
  font-size: 0.9rem;
`;

const EpisodeWatchButton = styled.button`
  background: ${props => props.watched ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  color: white;
  padding: 0.3rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.watched ? '#16a34a' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const EpisodeTitle = styled.h4`
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  line-height: 1.3;
`;

const EpisodeDate = styled.div`
  color: #999;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const EpisodeManager = ({ show, onClose }) => {
  const [expandedSeasons, setExpandedSeasons] = useState(new Set());
  const [watchedEpisodes, setWatchedEpisodes] = useState({});

  const { data: showDetails } = useQuery(
    ['showDetails', show.id],
    () => moviesAPI.getTVDetails(show.id || show.tmdb_id),
    {
      select: (response) => response.data,
    }
  );

  const { data: userWatchedEpisodes, refetch: refetchEpisodes } = useQuery(
    ['watchedEpisodes', show.id || show.tmdb_id],
    () => watchlistAPI.getWatchedEpisodes(show.id || show.tmdb_id),
    {
      select: (response) => response.data,
    }
  );

  useEffect(() => {
    if (userWatchedEpisodes) {
      const episodeMap = {};
      userWatchedEpisodes.forEach(ep => {
        const key = `${ep.season_number}-${ep.episode_number}`;
        episodeMap[key] = ep.watched;
      });
      setWatchedEpisodes(episodeMap);
    }
  }, [userWatchedEpisodes]);

  const handleSeasonToggle = (seasonNumber) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(seasonNumber)) {
      newExpanded.delete(seasonNumber);
    } else {
      newExpanded.add(seasonNumber);
    }
    setExpandedSeasons(newExpanded);
  };

  const handleMarkSeasonWatched = async (seasonNumber, watched) => {
    try {
      await watchlistAPI.markSeasonWatched({
        tmdb_show_id: show.id || show.tmdb_id,
        season_number: seasonNumber,
        watched
      });
      
      toast.success(`Temporada ${seasonNumber} marcada como ${watched ? 'vista' : 'no vista'}`);
      refetchEpisodes();
    } catch (error) {
      toast.error('Error al actualizar la temporada');
    }
  };

  const handleMarkEpisodeWatched = async (seasonNumber, episodeNumber, watched) => {
    try {
      await watchlistAPI.markEpisodeWatched({
        tmdb_show_id: show.id || show.tmdb_id,
        season_number: seasonNumber,
        episode_number: episodeNumber,
        watched
      });
      
      const key = `${seasonNumber}-${episodeNumber}`;
      setWatchedEpisodes(prev => ({
        ...prev,
        [key]: watched
      }));
      
      toast.success(`Episodio ${seasonNumber}x${episodeNumber} marcado como ${watched ? 'visto' : 'no visto'}`);
    } catch (error) {
      toast.error('Error al actualizar el episodio');
    }
  };

  if (!show) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>Gestionar {show.title || show.name}</Title>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>
        
        <Content>
          {showDetails?.seasons && (
            <SeasonList>
              {showDetails.seasons
                .filter(season => season.season_number > 0)
                .map((season) => (
                <SeasonCard key={season.id}>
                  <SeasonHeader>
                    <SeasonTitle>
                      Temporada {season.season_number} ({season.episode_count} episodios)
                    </SeasonTitle>
                    <SeasonActions>
                      <ActionButton
                        onClick={() => handleMarkSeasonWatched(season.season_number, true)}
                        primary
                      >
                        <Eye size={16} />
                        Marcar toda como vista
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleMarkSeasonWatched(season.season_number, false)}
                      >
                        <EyeOff size={16} />
                        Marcar como no vista
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleSeasonToggle(season.season_number)}
                      >
                        <Play size={16} />
                        {expandedSeasons.has(season.season_number) ? 'Ocultar' : 'Ver episodios'}
                      </ActionButton>
                    </SeasonActions>
                  </SeasonHeader>
                  
                  {expandedSeasons.has(season.season_number) && (
                    <SeasonEpisodes 
                      seasonNumber={season.season_number}
                      showId={show.id || show.tmdb_id}
                      watchedEpisodes={watchedEpisodes}
                      onMarkEpisodeWatched={handleMarkEpisodeWatched}
                    />
                  )}
                </SeasonCard>
              ))}
            </SeasonList>
          )}
        </Content>
      </ModalContainer>
    </ModalOverlay>
  );
};

const SeasonEpisodes = ({ seasonNumber, showId, watchedEpisodes, onMarkEpisodeWatched }) => {
  const { data: seasonDetails } = useQuery(
    ['seasonDetails', showId, seasonNumber],
    () => moviesAPI.getTVSeasonDetails(showId, seasonNumber),
    {
      select: (response) => response.data,
    }
  );

  if (!seasonDetails?.episodes) {
    return <div style={{ padding: '2rem', color: '#999', textAlign: 'center' }}>Cargando episodios...</div>;
  }

  return (
    <EpisodeGrid>
      {seasonDetails.episodes.map((episode) => {
        const episodeKey = `${seasonNumber}-${episode.episode_number}`;
        const isWatched = watchedEpisodes[episodeKey];
        
        return (
          <EpisodeCard key={episode.id} watched={isWatched}>
            <EpisodeHeader>
              <EpisodeNumber>
                {seasonNumber}x{episode.episode_number.toString().padStart(2, '0')}
              </EpisodeNumber>
              <EpisodeWatchButton
                watched={isWatched}
                onClick={() => onMarkEpisodeWatched(seasonNumber, episode.episode_number, !isWatched)}
              >
                {isWatched ? <Eye size={14} /> : <EyeOff size={14} />}
              </EpisodeWatchButton>
            </EpisodeHeader>
            
            <EpisodeTitle>{episode.name}</EpisodeTitle>
            
            {episode.air_date && (
              <EpisodeDate>
                <Calendar size={12} />
                {new Date(episode.air_date).toLocaleDateString()}
              </EpisodeDate>
            )}
          </EpisodeCard>
        );
      })}
    </EpisodeGrid>
  );
};

export default EpisodeManager;