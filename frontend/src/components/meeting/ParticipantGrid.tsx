import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ParticipantTile } from './ParticipantTile';
import type { MeetingLayout, MeetingParticipant } from '@/types';

interface ParticipantGridProps {
  participants: MeetingParticipant[];
  localStream?: MediaStream | null;
  layout: MeetingLayout;
  pinnedId: string | null;
  onPin?: (id: string | null) => void;
}

/** Adaptive participant grid with gallery / speaker / compact layouts. */
export const ParticipantGrid = ({
  participants,
  localStream,
  layout,
  pinnedId,
  onPin,
}: ParticipantGridProps) => {
  const locals = useMemo(() => participants.filter((participant) => participant.isLocal), [participants]);
  const remotes = useMemo(() => participants.filter((participant) => !participant.isLocal), [participants]);

  const pinned = useMemo(
    () => participants.find((participant) => participant.id === pinnedId) ?? null,
    [participants, pinnedId],
  );

  const activeSpeaker = useMemo(
    () => remotes.find((participant) => participant.isSpeaking) ?? null,
    [remotes],
  );

  /* ---------------- Speaker view ---------------- */
  if (layout === 'speaker' && activeSpeaker) {
    const audience = participants.filter((participant) => participant.id !== activeSpeaker.id);
    return (
      <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', minHeight: 0 }}>
        <motion.div layout style={{ flex: 1, minHeight: 0 }}>
          <ParticipantTile participant={activeSpeaker} size="lg" stream={null} />
        </motion.div>
        {audience.length > 0 && (
          <motion.div
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(audience.length, 4)}, 1fr)`,
              gap: 10,
              height: audience.length > 4 ? 168 : 132,
            }}
          >
        {audience.slice(0, 8).map((participant) => (
          <ParticipantTile
            key={participant.id}
            participant={participant}
            stream={participant.isLocal ? localStream : null}
            size="sm"
            onPin={onPin}
          />
        ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  /* ---------------- Pinned focus ---------------- */
  if (pinned) {
    const rest = participants.filter((participant) => participant.id !== pinned.id);
    return (
      <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', minHeight: 0 }}>
        <motion.div layout style={{ flex: 1, minHeight: 0 }}>
          <ParticipantTile
            participant={pinned}
            stream={pinned.isLocal ? localStream : null}
            size="lg"
            onPin={onPin}
          />
        </motion.div>
        {rest.length > 0 && (
          <motion.div
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(rest.length, 4)}, 1fr)`,
              gap: 10,
              height: 128,
            }}
          >
            {rest.slice(0, 8).map((participant) => (
              <ParticipantTile
                key={participant.id}
                participant={participant}
                stream={participant.isLocal ? localStream : null}
                size="sm"
                onPin={onPin}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  /* ---------------- Gallery (default) ---------------- */
  const ordered = [...locals, ...remotes];
  const cols =
    layout === 'compact'
      ? 'repeat(auto-fill, minmax(180px, 1fr))'
      : ordered.length <= 1
        ? '1fr'
        : ordered.length === 2
          ? 'repeat(2, 1fr)'
          : ordered.length <= 4
            ? 'repeat(2, 1fr)'
            : ordered.length <= 6
              ? 'repeat(3, 1fr)'
              : 'repeat(4, 1fr)';

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        layout
        data-testid="participant-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: layout === 'compact' ? 8 : 12,
          height: '100%',
          minHeight: 0,
          alignContent: 'center',
        }}
      >
        {ordered.map((participant) => (
          <ParticipantTile
            key={participant.id}
            participant={participant}
            stream={participant.isLocal ? localStream : null}
            onPin={onPin}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
