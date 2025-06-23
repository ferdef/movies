import React from 'react';
import styled from 'styled-components';
import { Calendar, Star, Plus, Check, Heart, X, Eye, EyeOff, ThumbsDown, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Card = styled(motion.div)`
  background: rgba(30, 30, 30, 0.9);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid ${props => 
    props.watched ? '#22c55e' : 
    props.liked === true ? '#f59e0b' :
    props.liked === false ? '#ef4444' :
    'transparent'
  };
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    border-color: ${props => 
      props.watched ? '#16a34a' :
      props.liked === true ? '#d97706' :
      props.liked === false ? '#dc2626' :
      '#e50914'
    };
    box-shadow: 0 10px 30px ${props => 
      props.watched ? 'rgba(34, 197, 94, 0.3)' :
      props.liked === true ? 'rgba(245, 158, 11, 0.3)' :
      props.liked === false ? 'rgba(239, 68, 68, 0.3)' :
      'rgba(229, 9, 20, 0.3)'
    };
  }
`;

const PosterContainer = styled.div`
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: ${props => 
    props.watched ? '#22c55e' : 
    props.liked === true ? '#f59e0b' :
    props.liked === false ? '#ef4444' :
    'transparent'
  };
  color: white;
  padding: 0.3rem;
  border-radius: 50%;
  display: ${props => props.watched || props.liked !== null ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const Poster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const PosterPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #333, #555);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.9rem;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 60%,
    rgba(0, 0, 0, 0.8) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${Card}:hover & {
    opacity: 1;
  }
`;

const Actions = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  
  ${Card}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? '#e50914' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.primary ? '#b8070f' : 'rgba(255, 255, 255, 0.2)'};
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Content = styled.div`
  padding: 1rem;
`;

const Title = styled.h3`
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #aaa;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const MediaType = styled.span`
  background: ${props => props.type === 'movie' ? '#e50914' : '#0070f3'};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const Status = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const StatusBadge = styled.span`
  background: ${props => {
    if (props.type === 'watched') return '#22c55e';
    if (props.type === 'liked') return '#f59e0b';
    if (props.type === 'disliked') return '#ef4444';
    return '#6b7280';
  }};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const MovieCard = ({ 
  item, 
  inWatchlist = false, 
  watchlistItem = null,
  onAddToWatchlist, 
  onRemoveFromWatchlist,
  onMarkWatched,
  onMarkLiked,
  onManageEpisodes,
  onClick 
}) => {
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const posterUrl = item.poster_url || item.poster_path;
  const mediaType = item.media_type;
  
  // Determinar si está marcado como visto (puede venir del watchlistItem o como prop directa)
  const isWatched = watchlistItem?.watched || false;
  const likedStatus = watchlistItem?.liked !== undefined ? watchlistItem.liked : null;
  
  const handleCardClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      watched={isWatched}
      liked={likedStatus}
    >
      <PosterContainer>
        {posterUrl ? (
          <Poster src={posterUrl} alt={title} />
        ) : (
          <PosterPlaceholder>
            Sin imagen
          </PosterPlaceholder>
        )}
        
        {/* Indicador de estado en la esquina */}
        <StatusIndicator 
          watched={isWatched}
          liked={likedStatus}
        >
          {isWatched ? (
            <CheckCircle size={14} />
          ) : likedStatus === true ? (
            <Heart size={14} />
          ) : likedStatus === false ? (
            <ThumbsDown size={14} />
          ) : null}
        </StatusIndicator>
        
        <Overlay>
          <Actions>
            {/* Botón de marcar como visto/no visto */}
            <ActionButton
              onClick={(e) => handleActionClick(e, () => {
                if (inWatchlist) {
                  onMarkWatched(watchlistItem.id, !isWatched);
                } else {
                  onMarkWatched(true, item);
                }
              })}
              title={isWatched ? "Marcar como no visto" : "Marcar como visto"}
              style={{ 
                background: isWatched ? '#22c55e' : 'rgba(255, 255, 255, 0.1)' 
              }}
            >
              {isWatched ? <CheckCircle size={16} /> : <Eye size={16} />}
            </ActionButton>

            {/* Botón de añadir a lista - solo si no está en watchlist */}
            {!inWatchlist && (
              <ActionButton
                onClick={(e) => handleActionClick(e, () => onAddToWatchlist(item))}
                title="Añadir a mi lista para ver más tarde"
              >
                <Plus size={16} />
              </ActionButton>
            )}

            {/* Botones de valoración - disponibles si está marcado como visto */}
            {isWatched && inWatchlist && (
              <>
                <ActionButton
                  onClick={(e) => handleActionClick(e, () => {
                    const newLiked = likedStatus === true ? null : true;
                    onMarkLiked(watchlistItem.id, newLiked);
                  })}
                  title="Me gusta"
                  style={{ 
                    background: likedStatus === true ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)' 
                  }}
                >
                  <Heart size={16} />
                </ActionButton>
                
                <ActionButton
                  onClick={(e) => handleActionClick(e, () => {
                    const newLiked = likedStatus === false ? null : false;
                    onMarkLiked(watchlistItem.id, newLiked);
                  })}
                  title="No me gusta"
                  style={{ 
                    background: likedStatus === false ? '#ef4444' : 'rgba(255, 255, 255, 0.1)' 
                  }}
                >
                  <ThumbsDown size={16} />
                </ActionButton>
              </>
            )}

            {/* Botón de gestión de episodios/temporadas - solo para series vistas */}
            {isWatched && item.media_type === 'tv' && onManageEpisodes && inWatchlist && (
              <ActionButton
                onClick={(e) => handleActionClick(e, () => onManageEpisodes(item))}
                title="Gestionar episodios y temporadas"
                style={{ background: 'rgba(59, 130, 246, 0.8)' }}
              >
                <Check size={16} />
              </ActionButton>
            )}

            {/* Botón de eliminar de lista - solo si está en watchlist */}
            {inWatchlist && (
              <ActionButton
                onClick={(e) => handleActionClick(e, () => onRemoveFromWatchlist(watchlistItem?.id))}
                title="Eliminar de mi lista"
              >
                <X size={16} />
              </ActionButton>
            )}
          </Actions>
        </Overlay>
      </PosterContainer>
      
      <Content>
        <Title>{title}</Title>
        
        <Info>
          {releaseDate && (
            <InfoItem>
              <Calendar size={14} />
              {new Date(releaseDate).getFullYear()}
            </InfoItem>
          )}
          
          {item.vote_average && (
            <InfoItem>
              <Star size={14} />
              {item.vote_average.toFixed(1)}
            </InfoItem>
          )}
        </Info>
        
        <MediaType type={mediaType}>
          {mediaType === 'movie' ? 'Película' : 'Serie'}
        </MediaType>
        
        {watchlistItem && (
          <Status>
            {watchlistItem.watched && (
              <StatusBadge type="watched">
                <Check size={12} />
                Visto
              </StatusBadge>
            )}
            
            {watchlistItem.liked === true && (
              <StatusBadge type="liked">
                <Heart size={12} />
                Me gusta
              </StatusBadge>
            )}
            
            {watchlistItem.liked === false && (
              <StatusBadge type="disliked">
                <X size={12} />
                No me gusta
              </StatusBadge>
            )}
          </Status>
        )}
      </Content>
    </Card>
  );
};

export default MovieCard;