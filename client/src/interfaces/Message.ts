export default interface Message {
    type: 'action' | 'data';
    name: string;
    payload: any;
  }