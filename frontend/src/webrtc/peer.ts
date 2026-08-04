/* ============================================================
   Peer connection manager — production WebRTC layer.

   Manages one RTCPeerConnection per remote participant,
   orchestrates offer/answer/ICE-candidate exchange through an
   abstract signaling channel, and exposes track-level media
   control (mute, camera, screen share). All failures degrade to
   clean errors so the UI can show premium error states.
   ============================================================ */

export interface MeetingSignalingChannel {
  sendOffer(payload: { meetingId: string; toId: string; offer: RTCSessionDescriptionInit }): void;
  sendAnswer(payload: { meetingId: string; toId: string; answer: RTCSessionDescriptionInit }): void;
  sendIce(payload: { meetingId: string; toId: string; candidate: RTCIceCandidateInit }): void;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  bundlePolicy: 'max-bundle',
  iceCandidatePoolSize: 4,
};

export class PeerConnectionManager {
  peers = new Map<string, RTCPeerConnection>();
  /** Buffered ICE candidates received before the remote description arrives. */
  pendingIce = new Map<string, RTCIceCandidateInit[]>();
  localStream: MediaStream | null = null;
  meetingId: string;
  signaling: MeetingSignalingChannel;

  constructor(meetingId: string, signaling: MeetingSignalingChannel) {
    this.meetingId = meetingId;
    this.signaling = signaling;
  }

  /* ---------------- Peer lifecycle ---------------- */

  /** Creates (or returns) the peer for a remote participant and binds remote tracks. */
  createPeer(peerId: string, onRemoteStream: (peerId: string, stream: MediaStream) => void): RTCPeerConnection {
    const existing = this.peers.get(peerId);
    if (existing) return existing;

    const peer = new RTCPeerConnection(RTC_CONFIG);

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;
      this.signaling.sendIce({
        meetingId: this.meetingId,
        toId: peerId,
        candidate: event.candidate.toJSON(),
      });
    };

    peer.ontrack = (event) => {
      const [track] = event.streams;
      if (track) onRemoteStream(peerId, track);
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed' || peer.connectionState === 'closed') {
        this.destroyPeer(peerId);
      }
    };

    this.peers.set(peerId, peer);

    // Attach local tracks so the peer is immediately usable.
    this.localStream?.getTracks().forEach((track) => {
      try {
        peer.addTrack(track, this.localStream!);
      } catch {
        /* track already attached */
      }
    });

    return peer;
  }

  /** Resolves buffered ICE candidates once the remote description is set. */
  flushPendingIce(peerId: string): void {
    const peer = this.peers.get(peerId);
    const buffered = this.pendingIce.get(peerId) ?? [];
    this.pendingIce.delete(peerId);
    buffered.forEach((candidate) => {
      void peer?.addIceCandidate(candidate).catch(() => undefined);
    });
  }

  /** Handles an incoming offer from a remote participant (answerer role). */
  async handleOffer(peerId: string, offer: RTCSessionDescriptionInit, onRemoteStream: (peerId: string, stream: MediaStream) => void): Promise<void> {
    const peer = this.createPeer(peerId, onRemoteStream);
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    this.signaling.sendAnswer({ meetingId: this.meetingId, toId: peerId, answer });
    this.flushPendingIce(peerId);
  }

  /** Handles an incoming answer (initiator role). */
  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer || peer.signalingState === 'stable') return;
    await peer.setRemoteDescription(answer);
    this.flushPendingIce(peerId);
  }

  /** Buffers or applies an incoming ICE candidate. */
  async handleIce(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    if (peer.remoteDescription) {
      await peer.addIceCandidate(candidate).catch(() => undefined);
    } else {
      const buffer = this.pendingIce.get(peerId) ?? [];
      buffer.push(candidate);
      this.pendingIce.set(peerId, buffer);
    }
  }

  /** Initiates a connection to a remote participant (offerer role). */
  async createOffer(peerId: string, onRemoteStream: (peerId: string, stream: MediaStream) => void): Promise<void> {
    const peer = this.createPeer(peerId, onRemoteStream);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    this.signaling.sendOffer({ meetingId: this.meetingId, toId: peerId, offer });
  }

  /* ---------------- Media control ---------------- */

  /** Attaches the local media stream and adds its tracks to every peer. */
  setLocalStream(stream: MediaStream): void {
    this.localStream = stream;
    this.peers.forEach((peer) => {
      stream.getTracks().forEach((track) => {
        try {
          peer.addTrack(track, stream);
        } catch {
          /* already attached */
        }
      });
    });
  }

  broadcastTrackUpdate(mutate: (track: MediaStreamTrack) => void): void {
    this.peers.forEach((peer) => {
      peer.getSenders().forEach((sender) => {
        if (sender.track) mutate(sender.track);
      });
    });
  }

  setAudioEnabled(enabled: boolean): void {
    this.broadcastTrackUpdate((track) => {
      if (track.kind === 'audio') track.enabled = enabled;
    });
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  setVideoEnabled(enabled: boolean): void {
    this.broadcastTrackUpdate((track) => {
      if (track.kind === 'video') track.enabled = enabled;
    });
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  /** Replaces a local track on all peers (camera switch / screen share). */
  replaceTrack(kind: 'audio' | 'video', track: MediaStreamTrack | null): void {
    this.peers.forEach((peer) => {
      const sender = peer
        .getSenders()
        .find((candidate) => candidate.track?.kind === kind || (candidate.track === null && kind === 'video'));
      if (sender) {
        void sender.replaceTrack(track).catch(() => undefined);
      }
    });
  }

  /* ---------------- Teardown ---------------- */

  destroyPeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    peer.getSenders().forEach((sender) => sender.track?.stop());
    peer.close();
    this.peers.delete(peerId);
    this.pendingIce.delete(peerId);
  }

  destroyAll(): void {
    Array.from(this.peers.keys()).forEach((peerId) => this.destroyPeer(peerId));
    this.localStream?.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        /* already stopped */
      }
    });
    this.localStream = null;
  }

  get peerCount(): number {
    return this.peers.size;
  }
}