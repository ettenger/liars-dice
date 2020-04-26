export default interface Message {
    type: 'action' | 'data' | 'heartbeat';
    name: string;
    payload: any;
  }