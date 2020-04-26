// Some consistent structure for WS Messages
export interface Message {
  type: 'action' | 'data' | 'heartbeat';
  name: string;
  payload: any;
}
