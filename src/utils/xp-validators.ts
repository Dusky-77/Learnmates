// Validate scroll speed (must be "slow/natural")
export function isValidScrollSpeed(speed: number): boolean {
  return speed > 0 && speed < 150; // pixels per second
}

// Validate active time (tab visible + mouse moving)
export function isValidActiveTime(tabVisible: boolean, mouseMoving: boolean): boolean {
  return tabVisible && mouseMoving;
}

// Validate question view (45+ seconds + both Q + MS)
export function isValidQuestionView(
  duration: number, 
  sawQuestion: boolean, 
  sawMS: boolean
): boolean {
  return duration >= 45 && sawQuestion && sawMS;
}
