export function patientDir(workspacePath: string, patientId: string): string {
  return `${workspacePath}/patients/${patientId}`;
}

export function sessionDir(
  workspacePath: string,
  patientId: string,
  sessionId: string
): string {
  return `${workspacePath}/patients/${patientId}/sessions/${sessionId}`;
}

export function earDir(
  workspacePath: string,
  patientId: string,
  sessionId: string,
  side: "left" | "right"
): string {
  return `${sessionDir(workspacePath, patientId, sessionId)}/${side}`;
}
