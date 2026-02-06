# Sound Files for Liquidation Terminal

This directory contains the audio files used by the LiquidationTerminal component.

## Required Files

### 1. `sonar.mp3`
- **Purpose**: Short beep sound played on every liquidation event
- **Suggestion**: A submarine sonar "ping" sound (0.5-1 second duration)
- **Where to find**:
  - freesound.org (search for "sonar ping" or "submarine ping")
  - zapsplat.com
  - soundjay.com

### 2. `guh.mp3`
- **Purpose**: Sound effect played when a whale liquidation occurs (>$100k)
- **Suggestion**: The famous "GUH" sound from the legendary r/wallstreetbets moment, or a dramatic alert sound
- **Where to find**:
  - Search YouTube for "guh sound effect" and use a converter
  - Use a dramatic alert/alarm sound from freesound.org
  - Record your own "GUH" 😄

## Audio Format Recommendations

- **Format**: MP3 or WAV
- **Duration**: Keep it short (0.5-2 seconds for sonar, 1-3 seconds for guh)
- **Volume**: Normalize volume levels so they're consistent
- **Sample Rate**: 44.1kHz or 48kHz
- **Bit Rate**: 128-320 kbps for MP3

## Testing

The audio plays automatically when liquidations occur. If you don't hear anything:
1. Check browser console for autoplay policy errors
2. Verify file paths are correct
3. Try interacting with the page first (click anywhere) to enable autoplay
4. Check your browser's autoplay settings

## License Note

Make sure any audio files you use are either:
- Licensed for your use (check Creative Commons licenses)
- Royalty-free
- Your own recordings

Avoid copyrighted material without proper licensing.
