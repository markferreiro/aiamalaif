
export class SocketManager {
    nsp: any;
    socket: any;

    constructor(private io: any) {
        //this.nsp = this.io.emit("room", "web");
        console.log("")
        this.io.on("connection", (socket: any) => {
            console.log("Client connected");
            this.socket = socket;
            this.socket.emit("room", "web");
            this.listen();
        });
    }

    // Add signal
    private listen(): void {
        this.socket.on("disconnect", () => this.disconnect());
        this.socket.on("toGroup", (message: string) => {
          //this.messageToGroup(message)
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
