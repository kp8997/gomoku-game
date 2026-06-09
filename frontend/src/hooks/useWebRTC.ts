import { useRef, useCallback } from 'react';

type SignalSender = (type: string, payload: object) => void;

/**
 * useWebRTC — manages the entire WebRTC peer connection lifecycle.
 *
 * Design rules:
 * - All peer connection objects live in refs (never in React state) to avoid
 *   triggering re-renders from the WebRTC event loop.
 * - This hook is completely stateless — the caller controls UI state.
 * - Supports full teardown + re-creation for room-rejoin scenarios.
 */
export function useWebRTC(sendSignal: SignalSender) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // ─── helpers ───────────────────────────────────────────────────────────────

  /** Stops mic tracks and closes the peer connection cleanly. */
  const teardown = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  }, []);

  /** Creates a new RTCPeerConnection and wires up ICE + remote track. */
  const createPeerConnection = useCallback((gameId: string, sender: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal('VOICE_ICE', {
          type: 'VOICE_ICE',
          gameId,
          sender,
          iceCandidate: JSON.stringify(e.candidate),
        });
      }
    };

    pc.ontrack = (e) => {
      if (!remoteAudioRef.current) {
        remoteAudioRef.current = new Audio();
        remoteAudioRef.current.autoplay = true;
      }
      remoteAudioRef.current.srcObject = e.streams[0];
    };

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === 'disconnected' ||
        pc.iceConnectionState === 'failed' ||
        pc.iceConnectionState === 'closed'
      ) {
        // Remote side went away — clean up silently; UI state managed by caller.
        teardown();
      }
    };

    pcRef.current = pc;
    return pc;
  }, [sendSignal, teardown]);

  // ─── caller side (initiates the call) ──────────────────────────────────────

  /**
   * Called by the player who clicked "Call".
   * Requests mic, creates offer, sends it via STOMP.
   */
  const startCall = useCallback(async (gameId: string, sender: string): Promise<void> => {
    teardown(); // clean up any previous connection first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      const pc = createPeerConnection(gameId, sender);
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal('VOICE_OFFER', {
        type: 'VOICE_OFFER',
        gameId,
        sender,
        sdp: JSON.stringify(pc.localDescription),
      });
    } catch (err) {
      console.error('[WebRTC] startCall failed:', err);
      teardown();
      throw err;
    }
  }, [createPeerConnection, sendSignal, teardown]);

  // ─── callee side (accepts the call) ────────────────────────────────────────

  /**
   * Called by the player who clicked "Accept".
   * Receives the offer SDP, creates an answer, sends it back.
   */
  const acceptCall = useCallback(async (gameId: string, sender: string, offerSdp: string): Promise<void> => {
    teardown();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      const pc = createPeerConnection(gameId, sender);
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      await pc.setRemoteDescription(JSON.parse(offerSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal('VOICE_ANSWER', {
        type: 'VOICE_ANSWER',
        gameId,
        sender,
        sdp: JSON.stringify(pc.localDescription),
      });
    } catch (err) {
      console.error('[WebRTC] acceptCall failed:', err);
      teardown();
      throw err;
    }
  }, [createPeerConnection, sendSignal, teardown]);

  // ─── handle incoming VOICE_ANSWER (caller receives this) ───────────────────

  const handleAnswer = useCallback(async (answerSdp: string): Promise<void> => {
    if (!pcRef.current) return;
    try {
      await pcRef.current.setRemoteDescription(JSON.parse(answerSdp));
    } catch (err) {
      console.error('[WebRTC] handleAnswer failed:', err);
    }
  }, []);

  // ─── handle incoming ICE candidates ────────────────────────────────────────

  const handleIceCandidate = useCallback(async (candidateJson: string): Promise<void> => {
    if (!pcRef.current) return;
    try {
      await pcRef.current.addIceCandidate(JSON.parse(candidateJson));
    } catch (err) {
      console.error('[WebRTC] addIceCandidate failed:', err);
    }
  }, []);

  // ─── mic mute toggle ───────────────────────────────────────────────────────

  const setMicEnabled = useCallback((enabled: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = enabled;
      });
    }
  }, []);

  return { startCall, acceptCall, handleAnswer, handleIceCandidate, setMicEnabled, teardown };
}
