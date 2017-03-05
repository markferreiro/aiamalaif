
export class SocketManager {
    nsp: any;
    socket: any;

    constructor(private io: any) {
        this.nsp = this.io.of("web");
        this.nsp.on("connection", (socket: any) => {
            console.log("Client connected");
            this.socket = socket;
            this.listen();
        });
    }

    // Add signal
    private listen(): void {
        this.socket.on("disconnect", () => this.disconnect());
        this.socket.on("toGroup", (message: string) => {
          //this.messageToGroup(message);
          console.log("Message to group: " + message);
        });
        this.socket.on("user", (uid: any, status: any, lat: any, lon: any) => {
          console.log("Got info user.");
        });
    }

    // Handle disconnect
    private disconnect(): void {
        console.log("Client disconnected");
    }
}
