type RoomSocketEvent =
    | 'room:joined'
    | 'room:left'
    | 'message:new'
    | 'message:deleted'
    | 'reaction:new'
    | 'member:muted'
    | 'member:kicked'
    | 'error';

type Listener = (payload: unknown) => void;

class InMemoryRoomSocket {
    private listeners = new Map<RoomSocketEvent, Set<Listener>>();

    on(event: RoomSocketEvent, listener: Listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(listener);
    }

    off(event: RoomSocketEvent, listener: Listener) {
        this.listeners.get(event)?.delete(listener);
    }

    emit(event: RoomSocketEvent, payload: unknown) {
        const list = this.listeners.get(event);
        if (!list) return;
        list.forEach((listener) => listener(payload));
    }

    clear() {
        this.listeners.clear();
    }
}

let socket: InMemoryRoomSocket | null = null;

export const roomRealtimeService = {
    connect(_accessToken: string, _roomAccessToken: string) {
        if (!socket) {
            socket = new InMemoryRoomSocket();
        }
        return socket;
    },

    disconnect() {
        socket?.clear();
        socket = null;
    },

    getSocket() {
        return socket;
    },
};
