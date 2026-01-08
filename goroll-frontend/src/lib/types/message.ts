// src/lib/types/message.ts

export interface Message {
    id: number;
    sender: 'user' | 'driver';
    text: string;
    timestamp: string;
  }