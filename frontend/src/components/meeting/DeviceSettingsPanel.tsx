import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import VideocamIcon from '@mui/icons-material/Videocam';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDevices } from '@/store/slices/meetingSlice';
import { selectMeetingDevicesList } from '@/store/selectors';
import { useMeetingMedia } from './useMeetingMedia';
import { groupDevices } from './useMeetingMedia';

interface DeviceSettingsPanelProps {
  onClose: () => void;
}

/** Premium device settings — camera/mic/speaker selection with live preview. */
export const DeviceSettingsPanel = ({ onClose }: DeviceSettingsPanelProps) => {
  const dispatch = useAppDispatch();
  const { localStream, toggleMic, toggleCamera, audioLevel, switchDevice } = useMeetingMedia();
  const devicesList = useAppSelector(selectMeetingDevicesList);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [speakerPlaying, setSpeakerPlaying] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const { audioInputs, videoInputs, audioOutputs } = groupDevices(devicesList);

  const controls = useAppSelector((state) => state.meeting.controls);
  const devices = useAppSelector((state) => state.meeting.devices);

  useEffect(() => {
    const video = videoRef.current;
    if (video && localStream) {
      video.srcObject = localStream;
      video.play().catch(() => undefined);
    }
    return () => {
      if (video) video.srcObject = null;
    };
  }, [localStream]);

  useEffect(() => {
    setMicLevel(audioLevel);
  }, [audioLevel]);

  const playTestTone = (): void => {
    setSpeakerPlaying(true);
    window.setTimeout(() => setSpeakerPlaying(false), 1200);
  };

  const handleChange = (kind: 'audioInput' | 'videoInput' | 'audioOutput', value: string): void => {
    dispatch(setDevices({ [kind]: value }));
    if (kind === 'audioInput' || kind === 'videoInput') {
      void switchDevice(kind === 'audioInput' ? 'audioinput' : 'videoinput', value);
    }
  };

  const rowStyle = { display: 'flex', flexDirection: 'column' as const, gap: 6 };

  return (
    <motion.aside
      data-testid="device-settings"
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      aria-label="Device settings"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        maxWidth: '88vw',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: 'rgba(13,19,34,0.94)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-16px 0 48px rgba(0,0,0,0.4)',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)' }}>Device settings</h3>
        <button
          onClick={onClose}
          aria-label="Close settings"
          style={{ border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, width: 30, height: 30, fontSize: '1rem' }}
        >
          ✕
        </button>
      </div>

      {/* Camera preview */}
      <div style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', background: '#0D1322', border: '1px solid rgba(255,255,255,0.1)' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', transform: 'scaleX(-1)', display: controls.camOn ? 'block' : 'none' }}
          data-testid="settings-camera-preview"
        />
        {!controls.camOn && (
          <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 600 }}>
            <VideocamIcon sx={{ mr: 1, fontSize: 18 }} /> Camera off
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            gap: 6,
            alignItems: 'center',
            background: 'rgba(10,14,26,0.7)',
            borderRadius: 999,
            padding: '3px 10px',
            fontSize: '0.66rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          <GraphicEqIcon sx={{ fontSize: 13, color: '#2DD4BF' }} />
          <span style={{ width: 44 }}>
            <span
              style={{
                display: 'inline-block',
                height: 4,
                borderRadius: 99,
                background: micLevel > 0.12 ? '#2DD4BF' : 'rgba(255,255,255,0.2)',
                width: `${Math.min(100, micLevel * 140)}%`,
                transition: 'width 80ms linear',
              }}
            />
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={toggleCamera}
          sx={{ flex: 1, color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: '#8E80FF', color: '#A99CFF' } }}
        >
          {controls.camOn ? 'Turn off' : 'Turn on'}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={toggleMic}
          sx={{ flex: 1, color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: '#2DD4BF', color: '#5EEAD4' } }}
        >
          {controls.micOn ? 'Mute' : 'Unmute'}
        </Button>
      </div>

      <div style={rowStyle}>
        <FormControl size="small" variant="outlined">
          <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-focused': { color: '#8E80FF' } }}>Camera</InputLabel>
          <Select
            value={devices.videoInput}
            onChange={(event: SelectChangeEvent) => handleChange('videoInput', event.target.value)}
            label="Camera"
            sx={{
              color: 'rgba(255,255,255,0.92)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
              '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.6)' },
            }}
          >
            {(videoInputs.length > 0 ? videoInputs : [{ deviceId: 'default', label: 'Default — HD Webcam', kind: 'videoinput' } as const]).map((device) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div style={rowStyle}>
        <FormControl size="small" variant="outlined">
          <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-focused': { color: '#8E80FF' } }}>Microphone</InputLabel>
          <Select
            value={devices.audioInput}
            onChange={(event: SelectChangeEvent) => handleChange('audioInput', event.target.value)}
            label="Microphone"
            sx={{
              color: 'rgba(255,255,255,0.92)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
              '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.6)' },
            }}
          >
            {(audioInputs.length > 0 ? audioInputs : [{ deviceId: 'default', label: 'Default — Microphone', kind: 'audioinput' } as const]).map((device) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div style={rowStyle}>
        <FormControl size="small" variant="outlined">
          <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-focused': { color: '#8E80FF' } }}>Speaker</InputLabel>
          <Select
            value={devices.audioOutput}
            onChange={(event: SelectChangeEvent) => handleChange('audioOutput', event.target.value)}
            label="Speaker"
            sx={{
              color: 'rgba(255,255,255,0.92)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
              '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.6)' },
            }}
          >
            {(audioOutputs.length > 0 ? audioOutputs : [{ deviceId: 'default', label: 'Default — Speakers', kind: 'audiooutput' } as const]).map((device) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          size="small"
          onClick={playTestTone}
          disabled={speakerPlaying}
          sx={{ color: '#5EEAD4', fontSize: '0.7rem', textTransform: 'none', alignSelf: 'flex-start' }}
        >
          {speakerPlaying ? 'Playing test tone…' : 'Test speaker'}
        </Button>
      </div>

      <div
        style={{
          borderRadius: 12,
          background: 'rgba(45,212,191,0.08)',
          border: '1px solid rgba(45,212,191,0.2)',
          padding: '10px 12px',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: '#5EEAD4' }}>Pro tip:</strong> echo cancellation & noise suppression are enabled automatically. Use headphones for the best experience.
      </div>
    </motion.aside>
  );
};
