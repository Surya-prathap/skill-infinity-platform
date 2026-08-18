package com.skillinfinity.session.enumeration;

public enum MeetingProvider {
    /** Discord — meetings happen through Discord invite links (no WebRTC). */
    DISCORD,
    /** Custom/legacy link kept for backward compatibility with stored rows. */
    CUSTOM
}
