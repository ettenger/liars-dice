// Some consistent structure for WS Messages
export interface Message {
  type: 'action' | 'data';
  name: string;
  payload: any;
}

export default Message;